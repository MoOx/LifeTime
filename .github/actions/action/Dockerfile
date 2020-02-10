# Container image that runs your code
FROM alpine:3.10

# set inotify and start the node application, replace yar with your command
RUN echo "#!/bin/sh \n\
    echo \"fs.inotify.max_user_watches: before update\" \n\
    cat /etc/sysctl.conf\n\
    echo \"fs.inotify.max_user_watches: updating\" \n\
    echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sysctl -p \n\
    echo \"fs.inotify.max_user_watches: updated value\" \n\
    cat /etc/sysctl.conf | grep fs.inotify \n\
    " >> /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
