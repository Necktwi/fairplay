//Author: Gowtham
//Copyright 2013 Ferryfair, Inc.
//2013/05/13 10:01:00

/*!
 ferrytools.js
 Version 1.0
 
 ferrytools.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Video.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.
 
 You should have received a copy of the GNU Lesser General Public License
 along with Video.js.  If not, see <http://www.gnu.org/licenses/>.
 */

window.ferrytools = {
    launchpad: function(url, content, postExpedition) {
        if (this instanceof arguments.callee) {
            this.url = url;
            this.content = content;
            this.postExpedition = postExpedition;
            this.response = "";
            this.launch = function() {
                delete this.ferry;
                this.ferry = ferrytools.ferry(this);
            }
        } else {
            throw 'launchpad object constructor cannot be called as a function';
        }
    },
    ferry: function(launchpad) {
        var ferry;
        if (launchpad.async === undefined) {
            launchpad.async = true;
        }
        if (launchpad.url.search("ws://") === 0 || launchpad.url.search("wss://") === 0) {
            var port;
            var path;
            var pathIndex;
            var portIndex;
            pathIndex = launchpad.url.indexOf("/", 5);
            if (pathIndex > 0) {
                path = launchpad.url.substring(pathIndex + 1, src.length)
            }
            portIndex = launchpad.url.indexOf(":", 5);
            if (portIndex > 0 && ((pathIndex > 0) === (portIndex < pathIndex))) {
                port = launchpad.url.substring(portIndex + 1, pathIndex > 0 ? pathIndex : launchpad.url.length);
            }
            port = port.length > 0 ? port : "17291";
            var dn = launchpad.url.substring(5, portIndex > 0 ? portIndex : (pathIndex > 0 ? pathIndex : launchpad.url.length));
            ferry = new WebSocket("ws://" + dn + ":" + port, launchpad.protocol);
            launchpad.ferry = ferry;
            ferry.responseText = "";    
            var onopenFired = false;
            ferry.onopen = function() {
                launchpad.postExpedition();
            };
            ferry.onerror = function() {
                launchpad.oncrash();
            }
            ferry.onclose = function() {
                launchpad.onclose();
            }
        } else {
            ferry = new XMLHttpRequest();
            launchpad.ferry = ferry;
            ferry.open("POST", launchpad.url, launchpad.async);
            ferry.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            if (launchpad.reqHeaders !== undefined) {
                for (var i = 0; i < launchpad.reqHeaders.length; i++) {
                    ferry.setRequestHeader(launchpad.reqHeaders[i][0], launchpad.reqHeaders[i][1]);
                }
            }
            if (launchpad.content !== undefined && launchpad.content.__proto__ === new Object().__proto__) {
                var content = [];
                launchpad.content.role = core.userInfo.role;
                launchpad.content.SESSION_ID = sessionId;
                for (var id in launchpad.content) {
                    content[content.length] = encodeURIComponent(id) + "=" + encodeURIComponent(launchpad.content[id]);
                }
                content = content.join('&');
            }
            if (launchpad.upldOnProgress) {
                ferry.upload.onprogress = launchpad.upldOnProgress;
            }
            ferry.onreadystatechange = function() {
                if (ferry.readyState === 3) {
                    if (launchpad.onreceiving) {
                        launchpad.onreceiving();
                    }
                }
                if (ferry.status === 200 && this.readyState === 4) {
                    launchpad.postExpedition();
                }
            };
            ferry.send(launchpad.content);
        }
        ferry.launchpad = launchpad;
        return ferry;
    }
};