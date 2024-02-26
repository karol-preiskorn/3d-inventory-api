# SERVICES:       podman
# DESCRIPTION:    Image with DbSchema
# TO_BUILD:       podman build -t dbschema -
# TO_RUN:         podman run -d --rm -it  -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=unix$DISPLAY --name dbschema dbschema

FROM openjdk:latest

RUN yum update
RUN yum install -y -q wget libXext.x86_64 libXrender.x86_64 libXtst.x86_64
RUN wget -O /tmp/dbschema.rpm https://dbschema.com/download/DbSchema_linux_9_5_2.rpm -q --show-progress --progress=dot:giga
RUN ls /tmp
RUN yum install /tmp/dbschema.rpm
RUN rm /tmp/dbschema.rpm
RUN yum remove -y -q wget
RUN yum clean -y -q all

RUN useradd --create-home --shell /bin/bash user
USER user
RUN ls /opt/DbSchema/
CMD ["/opt/DbSchema/DbSchema"]
