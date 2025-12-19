LOCALE=$(getprop ro.product.locale)
DIR=/data/adb/frame_tracker
[ -d $DIR ] && rm -rf $MODPATH/webroot/csv
mkdir -p $DIR/csv $DIR/output
cp -f $MODPATH/webroot/csv/* $DIR/csv
ui_print "- Put the .csv file into the storage folder to load"
ui_print "- Storage folder: $DIR/csv"
