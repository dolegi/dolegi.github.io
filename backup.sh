rsync -r -e "ssh -i ~/.ssh/hertzner_rsa" www/ root@web:/var/www
rsync -r -e "ssh -i ~/.ssh/hertzner_rsa" Caddyfile root@web:/etc/caddy/Caddyfile
