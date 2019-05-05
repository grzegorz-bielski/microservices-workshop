#!/usr/bin/env sh
case "$1" in
    'messaging')
        node /app/build/services/messaging/src/index.js --configKey messaging
    ;;
    'ui-gateway')
        node /app/build/services/gateway/src/index.js --configKey gateway
    ;;  
    *)
    exec "$@"
esac

exit 0