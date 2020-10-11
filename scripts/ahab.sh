echo "Your DATABASE will die in five seconds!"
echo "To abort, press 'Control + C' RIGHT NOW!!!"
sleep 5
echo " "
echo "killing your whales..."
echo " "
docker stop $(docker ps  -q)
docker container prune -f
echo " "
echo "your whales are dead!"
echo " "