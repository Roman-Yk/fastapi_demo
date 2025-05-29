#!/bin/sh

# safety switch, exit script if there's error. Full command of shortcut `set -e`
set -o errexit
# safety switch, uninitialized variables will stop script. Full command of shortcut `set -u`
set -o nounset

# tear down function
teardown()
{
    echo " Signal caught..."
    echo "Stopping celery multi gracefully..."
    
    # send shutdown signal to celery workser via `celery multi`
    # command must mirror some of `celery multi start` arguments
    # celery -A config.celery_app multi stop 3 \
    celery -A app.modules.celery multi stop 7 \
        --pidfile=./celery-%n.pid \
        --logfile=./celery-%n%I.log
    
    
    echo "Stopped celery multi..."
    echo "Stopping last waited process"
    kill -s TERM "$child" 2> /dev/null
    echo "Stopped last waited process. Exiting..."
    exit 1
}

# start 3 celery worker via `celery multi` with declared logfile for `tail -f`
# celery -A config.celery_app multi start 3 -l INFO -Q:1 queue1 -Q:2 queue1 -Q:3 queue3,celery -c:1-2 1 \
celery -A app.modules.celery multi start cpu -c:cpu 2 -Q:cpu cpu -l INFO \
    --pidfile=./celery-%n.pid \
    --logfile=./celery-%n%I.log \
#    -P solo\ uncomment if you need the task logs.

# start trapping signals (docker sends `SIGTERM` for shudown)
trap teardown SIGINT SIGTERM

# tail all the logs continuously to console for `docker logs` to see
tail -f ./celery*.log &

# capture process id of `tail` for tear down
child=$!

# waits for `tail -f` indefinitely and allows external signals,
# including docker stop signals, to be captured by `trap`
wait "$child"
