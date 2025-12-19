DIR=/data/adb/frame_tracker
{
    until [ -d $DIR ] && [ -d /data ]; do
        sleep 1
    done
    rm -rf $DIR
} &
