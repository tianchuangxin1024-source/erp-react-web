#!/usr/bin/env bash
set -Eeuo pipefail

web_root=${1:?Missing web root}
release_id=${2:?Missing release ID}
server_name=${3:?Missing server name}
listen_port=${4:?Missing listen port}
nginx_conf=${5:-/etc/nginx/conf.d/erp-react-web.conf}

[[ "$web_root" =~ ^/[a-zA-Z0-9_/-]+$ && "$web_root" != "/" && "$web_root" != */ && "$web_root" != *".."* ]] || { echo "Invalid web root" >&2; exit 1; }
[[ "$release_id" =~ ^[0-9]{14}-[a-f0-9]{8}$ ]] || { echo "Invalid release ID" >&2; exit 1; }
[[ "$server_name" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo "Invalid server name" >&2; exit 1; }
[[ "$listen_port" =~ ^[0-9]+$ && "$listen_port" -ge 1 && "$listen_port" -le 65535 ]] || { echo "Invalid port" >&2; exit 1; }
[[ "$nginx_conf" =~ ^/[a-zA-Z0-9_./-]+\.conf$ && "$nginx_conf" != *".."* ]] || { echo "Invalid Nginx configuration path" >&2; exit 1; }

for command in nginx tar curl flock install cmp readlink; do
    command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }
done
[[ -d "$(dirname "$nginx_conf")" ]] || { echo "Nginx configuration directory is missing" >&2; exit 1; }

mkdir -p "$web_root/.incoming" "$web_root/releases"
chmod 755 "$web_root" "$web_root/releases"
web_root=$(readlink -f "$web_root")
exec 9>"$web_root/.deploy.lock"
flock -n 9 || { echo "Another deployment is running" >&2; exit 1; }

incoming="$web_root/.incoming/$release_id"
archive="$incoming.tar.gz"
candidate_conf="$incoming.conf"
release="$web_root/releases/$release_id"
current="$web_root/current"
previous=""
config_existed=false
changed=false

[[ -f "$archive" && -f "$candidate_conf" ]] || { echo "Upload is incomplete" >&2; exit 1; }
[[ ! -e "$release" && ! -L "$release" ]] || { echo "Release already exists" >&2; exit 1; }
if [[ -e "$current" || -L "$current" ]]; then
    [[ -L "$current" ]] || { echo "current must be a release symlink" >&2; exit 1; }
    previous=$(readlink -f "$current")
    [[ "$previous" == "$web_root/releases/"* && -d "$previous" ]] || { echo "Existing release points outside releases" >&2; exit 1; }
fi
if [[ -e "$nginx_conf" || -L "$nginx_conf" ]]; then
    [[ -f "$nginx_conf" && ! -L "$nginx_conf" ]] || { echo "Nginx configuration must be a regular file" >&2; exit 1; }
    config_existed=true
    cp -p "$nginx_conf" "$incoming.previous.conf"
fi
nginx -t

restore() {
    local result=${1:-$?}
    set +e
    trap - ERR INT TERM
    if [[ "$changed" == true ]]; then
        if [[ -n "$previous" ]]; then
            ln -s "$previous" "$web_root/.rollback-$release_id"
            mv -Tf "$web_root/.rollback-$release_id" "$current"
        else
            rm -f "$current"
        fi
        if [[ "$config_existed" == true ]]; then
            install -m 644 "$incoming.previous.conf" "$nginx_conf"
        else
            rm -f "$nginx_conf"
        fi
        nginx -t && nginx -s reload || echo "Automatic Nginx rollback needs attention" >&2
        echo "Deployment failed. Previous release and configuration restored." >&2
    fi
    exit "$result"
}
trap restore ERR
trap 'restore 130' INT
trap 'restore 143' TERM

while IFS= read -r entry; do
    case "$entry" in
        /*|..|../*|*/../*|*/..) echo "Unsafe archive member" >&2; exit 1 ;;
    esac
done < <(tar -tzf "$archive")
mkdir "$release"
tar -xzf "$archive" -C "$release" --no-same-owner --no-same-permissions
[[ -s "$release/index.html" && -d "$release/assets" ]]
chmod -R u=rwX,go=rX "$release"

changed=true
ln -s "$release" "$web_root/.current-$release_id"
mv -Tf "$web_root/.current-$release_id" "$current"
install -m 644 "$candidate_conf" "$nginx_conf"
nginx -t
nginx -s reload

curl --noproxy '*' --fail --silent --show-error --max-time 15 --retry 2 --retry-connrefused \
    -H "Host: $server_name" "http://127.0.0.1:$listen_port/" -o "$incoming.index.html"
cmp -s "$release/index.html" "$incoming.index.html"

api_status=$(curl --noproxy '*' --silent --show-error --max-time 15 \
    -H "Host: $server_name" "http://127.0.0.1:$listen_port/api/auth/session" \
    -o "$incoming.session.json" -w '%{http_code}')
[[ "$api_status" == "200" || "$api_status" == "401" ]]
grep -Eq '"code"[[:space:]]*:[[:space:]]*(200|401)' "$incoming.session.json"

trap - ERR INT TERM
echo "Published release $release_id"
echo "Web root: $current"
echo "HTTP and API session checks passed ($api_status)."
echo "Prior release: ${previous:-none}"
