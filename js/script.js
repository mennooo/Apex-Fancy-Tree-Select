var fancyTree = (function () {
    var scriptVersion = "1.1";
    var util = {
        version: "1.0.1",
        escapeHTML: function (str) {
            if (str === null) {
                return null;
            }
            if (typeof str === "undefined") {
                return;
            }
            if (typeof str === "object") {
                try {
                    str = JSON.stringify(str);
                } catch (e) {
                    /*do nothing */
                }
            }
            try {
                return apex.util.escapeHTML(String(str));
            } catch (e) {
                str = String(str);
                return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#x27;")
                    .replace(/\//g, "&#x2F;");
            }
        },
        convertJSON2LowerCase: function (obj) {
            var output = {};
            try {

                for (i in obj) {
                    if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
                        output[i.toLowerCase()] = util.convertJSON2LowerCase(obj[i]);
                    } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
                        output[i.toLowerCase()] = [];
                        output[i.toLowerCase()].push(util.convertJSON2LowerCase(obj[i][0]));
                    } else {
                        output[i.toLowerCase()] = obj[i];
                    }
                }

            } catch (e) {
                console.error("error while to lower json");
                console.error(e);
            }
            return output;
        },
        tooltip: {
            show: function (htmlContent, backgroundColor, maxWidth) {
                try {
                    if ($("#dynToolTip").length == 0) {
                        var tooltip = $("<div></div>")
                            .attr("id", "dynToolTip")
                            .css("max-width", "400px")
                            .css("position", "absolute")
                            .css("top", "0px")
                            .css("left", "0px")
                            .css("z-index", "2000")
                            .css("background-color", "rgba(240, 240, 240, 1)")
                            .css("padding", "10px")
                            .css("display", "block")
                            .css("top", "0")
                            .css("overflow-wrap", "break-word")
                            .css("word-wrap", "break-word")
                            .css("-ms-hyphens", "auto")
                            .css("-moz-hyphens", "auto")
                            .css("-webkit-hyphens", "auto")
                            .css("hyphens", "auto");
                        if (backgroundColor) {
                            tooltip.css("background-color", backgroundColor);
                        }
                        if (maxWidth) {
                            tooltip.css("max-width", maxWidth);
                        }
                        $("body").append(tooltip);
                    } else {
                        $("#dynToolTip").css("visibility", "visible");
                    }
                    $("#dynToolTip").html(htmlContent);
                } catch (e) {
                    console.error('Error while try to show tooltip');
                    console.error(e);
                }
            },
            setPosition: function (event) {
                $("#dynToolTip").position({
                    my: "left+6 top+6",
                    of: event,
                    collision: "flipfit"
                });
            },
            hide: function () {
                $("#dynToolTip").css("visibility", "hidden");
            },
            remove: function () {
                $("#dynToolTip").remove();
            }
        },
        jsonSaveExtend: function (srcConfig, targetConfig) {
            var finalConfig = {};
            /* try to parse config json when string or just set */
            if (typeof targetConfig === 'string') {
                try {
                    targetConfig = JSON.parse(targetConfig);
                } catch (e) {
                    console.error("Error while try to parse udConfigJSON. Please check your Config JSON. Standard Config will be used.");
                    console.error(e);
                    console.error(targetConfig);
                }
            } else {
                finalConfig = targetConfig;
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend(true, srcConfig, targetConfig);
            } catch (e) {
                console.error('Error while try to merge udConfigJSON into Standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.');
                console.error(e);
                finalConfig = srcConfig;
                console.error(finalConfig);
            }
            return finalConfig;
        },
        setItemValue: function (itemName, value) {
            try {
                if (apex.item(itemName) && apex.item(itemName).node != false) {
                    apex.item(itemName).setValue(value);
                } else {
                    console.error('Please choose a set item. Because the value (' + value + ') can not be set on item (' + itemName + ')');
                }
            } catch (e) {
                console.error("Error while try to call apex.item" + e);
            }
        },
        noDataMessage: {
            show: function (id, text) {
                var div = $("<div></div>")
                    .css("margin", "12px")
                    .css("text-align", "center")
                    .css("padding", "64px 0")
                    .addClass("nodatafoundmessage");

                var subDiv = $("<div></div>");

                var subDivSpan = $("<span></span>")
                    .addClass("fa")
                    .addClass("fa-search")
                    .addClass("fa-2x")
                    .css("height", "32px")
                    .css("width", "32px")
                    .css("color", "#D0D0D0")
                    .css("margin-bottom", "16px");

                subDiv.append(subDivSpan);

                var span = $("<span></span>")
                    .text(text)
                    .css("display", "block")
                    .css("color", "#707070")
                    .css("font-size", "12px");

                div
                    .append(subDiv)
                    .append(span);

                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.nodatafoundmessage').remove();
            }
        },
        loader: {
            start: function (id) {
                try {
                    apex.util.showSpinner($(id));
                } catch (e) {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + id);
                    faLoader.addClass("ct-loader fa-stack fa-3x");

                    /* define circle for loader */
                    var faCircle = $("<i></i>");
                    faCircle.addClass("fa fa-circle fa-stack-2x");
                    faCircle.css("color", "rgba(121,121,121,0.6)");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-spin fa-inverse fa-stack-1x");
                    faRefresh.css("animation-duration", "1.8s");

                    /* append loader */
                    faLoader.append(faCircle);
                    faLoader.append(faRefresh);
                    $(id).append(faLoader);
                }
            },
            stop: function (id) {
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        copyJSONObject: function (object) {
            try {
                var objectCopy = {};
                var key;

                for (key in object) {
                    objectCopy[key] = object[key];
                }
                return objectCopy;
            } catch (e) {
                console.error('Error while try to copy object');
                console.error(e);
            }
        }
    };

    return {
        initTree: function (regionID, ajaxID, noDataMessage, udConfigJSON, items2Submit, escapeHTML) {
            var configJSON = {}
            var stdConfigJSON = {
                "checkbox": "fa-square-o",
                "checkboxSelected": "fa-check-square",
                "checkboxUnknown": "fa-square",
                "selectMode": 2,
                "autoExpand2Level": 2,
                "enableKeyBoard": true,
                "enableQuicksearch": true,
                "enableCheckBox": true,
                "refresh": 0
            }

            //extend configJSON with iven attributes
            configJSON = util.jsonSaveExtend(stdConfigJSON, udConfigJSON);
            configJSON.regionID = regionID;
            configJSON.ajaxID = ajaxID;
            configJSON.noDataMessage = noDataMessage;
            configJSON.items2Submit = items2Submit;

            if (escapeHTML !== false) {
                configJSON.escapeHTML = true;
            }

            var treeSort = function (options) {
                    var cfi, e, i, id, o, pid, rfi, ri, thisid, _i, _j, _len, _len1, _ref, _ref1;
                    id = options.id || "id";
                    pid = options.parent_id || "parent_id";
                    ri = [];
                    rfi = {};
                    cfi = {};
                    o = [];
                    _ref = options.q;
                    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                        e = _ref[i];
                        rfi[e[id]] = i;
                        if (cfi[e[pid]] == null) {
                            cfi[e[pid]] = [];
                        }
                        cfi[e[pid]].push(options.q[i][id]);
                    }
                    _ref1 = options.q;
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        e = _ref1[_j];
                        if (rfi[e[pid]] == null) {
                            ri.push(e[id]);
                        }
                    }
                    while (ri.length) {
                        thisid = ri.splice(0, 1);
                        o.push(options.q[rfi[thisid]]);
                        if (cfi[thisid] != null) {
                            ri = cfi[thisid].concat(ri);
                        }
                    }
                    return o;
                },
                buildTree = function (options) {
                    var children, e, id, o, pid, temp, _i, _len, _ref;
                    id = options.id || "id";
                    pid = options.parent_id || "parent_id";
                    children = options.children || "children";
                    temp = {};
                    o = [];
                    _ref = options.q;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        e = _ref[_i];
                        e[children] = [];
                        temp[e[id]] = e;
                        if (temp[e[pid]] != null) {
                            temp[e[pid]][children].push(e);
                        } else {
                            o.push(e);
                        }
                    }
                    return o;
                },
                addTooltip = function () {
                    $(configJSON.regionID).find(".fancytree-title").each(function () {
                        var $t = $(this);
                        $t.attr({
                                tooltip: $t.attr('title'),
                            })
                            .removeAttr('title');
                        $t.mouseenter(function () {
                            var title = $t.attr("tooltip");
                            if (title.length > 0) {
                                if (configJSON.escapeHTML) {
                                    title = util.escapeHTML(title);
                                }
                                util.tooltip.show(title);
                            }
                        });
                        $t.mousemove(function (event) {
                            util.tooltip.setPosition(event);
                        });
                        $t.mouseleave(function (event) {
                            util.tooltip.hide();
                        });
                    });
                },
                getData = function (sucFunction) {
                    util.loader.start(configJSON.regionID);
                    try {
                        apex.server.plugin(
                            configJSON.ajaxID, {
                                pageItems: configJSON.items2Submit
                            }, {
                                success: sucFunction,
                                error: function (d) {
                                    util.loader.stop(configJSON.regionID);
                                    $(configJSON.regionID).empty();
                                    console.error(d.responseText);
                                },
                                dataType: "json"
                            });
                    } catch (e) {
                        console.log(e);
                        drawTree(data);
                    }
                },
                sortNumber = function (a, b) {
                    return a - b;
                },
                prepareData = function (data) {
                    try {
                        /* draw cards and add it to the rows */

                        // lower json from sql
                        var _root = util.convertJSON2LowerCase(data.row);

                        // fill up icons
                        if (configJSON.typeSettings) {
                            $.each(_root, function (i, val) {
                                configJSON.typeSettings.forEach(function (obj) {
                                    if (obj.id == val.type) {
                                        if (!val.icon || val.icon.length == 0) {
                                            val.icon = "fa " + obj.icon;
                                        }
                                    }
                                });
                            });
                        }

                        // restructure json for fancyTree
                        var dataArr = [];

                        for (var i in _root) {
                            dataArr.push(_root[i]);
                        }
                        _root = treeSort({
                            q: dataArr
                        });

                        _root = buildTree({
                            q: _root
                        });
                        if (data.row && data.row.length > 0) {
                            util.noDataMessage.hide(configJSON.regionID);
                        } else {
                            util.noDataMessage.show(configJSON.regionID, configJSON.noDataMessage);

                        }
                        return _root;
                    } catch (e) {
                        util.loader.stop(configJSON.regionID);
                        $(configJSON.regionID).empty();
                        console.error("error while try to prepare data for tree.");
                        console.error(e);
                    }
                },
                updateTree = function (data) {
                    var _root = prepareData(data);
                    var tree = $(configJSON.regionID).fancytree('getTree');
                    tree.reload(_root);
                    util.loader.stop(configJSON.regionID);
                },
                drawTree = function (data) {
                    var _root = prepareData(data);

                    // draw fancyTree
                    $(configJSON.regionID).fancytree({
                        extensions: ["glyph"],
                        clones: {
                            highlightClones: true
                        },
                        activeVisible: true, // Make sure, active nodes are visible (expanded).
                        escapeTitles: configJSON.escapeHTML,
                        checkbox: configJSON.enableCheckBox,
                        selectMode: configJSON.selectMode,
                        debugLevel: 0, // 0:quiet, 1:normal, 2:debug
                        keyboard: configJSON.enableKeyBoard, // Support keyboard navigation.
                        quicksearch: configJSON.enableQuicksearch, // Navigate to next node by typing the first letters.
                        glyph: {
                            preset: "awesome4",
                            map: {
                                _addClass: "fa",
                                checkbox: configJSON.checkbox,
                                checkboxSelected: configJSON.checkboxSelected,
                                checkboxUnknown: configJSON.checkboxUnknown,
                                dragHelper: "fa-arrow-right",
                                dropMarker: "fa-long-arrow-right",
                                error: "fa-warning",
                                expanderClosed: "fa-caret-right",
                                expanderLazy: "fa-angle-right",
                                expanderOpen: "fa-caret-down",
                                loading: "fa-spinner fa-pulse",
                                nodata: "fa-meh-o",
                                noExpander: "",
                                radio: "fa-circle-thin",
                                radioSelected: "fa-circle",
                                doc: "fa-file-o",
                                docOpen: "fa-file-o",
                                folder: "fa-folder-o",
                                folderOpen: "fa-folder-open-o"
                            }
                        },
                        source: _root,
                        // if select an item check different types from config json and set value to the items
                        select: function (event, data) {
                            if (data.node.extraClasses != '') {
                                if ($(data.node.li).find('.fancytree-node').hasClass('fancytree-selected'))
                                    $('.' + data.node.extraClasses).addClass('fancytree-selected');
                                else
                                    $('.' + data.node.extraClasses).removeClass('fancytree-selected');
                            }

                            if (configJSON.typeSettings) {
                                var tmpStore = [];
                                configJSON.typeSettings.forEach(function (obj) {
                                    tmpStore.push(util.copyJSONObject(obj));
                                });
                                $.each($(configJSON.regionID).fancytree('getTree').getSelectedNodes(), function (i, data) {
                                    tmpStore.forEach(function (obj, idx) {
                                        if (obj.id) {
                                            if (data.type) {
                                                if (data.type == obj.id) {
                                                    if (tmpStore[idx].data === undefined) {
                                                        tmpStore[idx].data = [];
                                                    }
                                                    if (tmpStore[idx].data.indexOf(data.data.value) === -1) {
                                                        if (data.data.value) {
                                                            tmpStore[idx].data.push(data.data.value);
                                                        }
                                                    }
                                                }
                                            } else {
                                                console.error("type in not set in data");
                                            }
                                        } else {
                                            console.error("id is not defined in config json in types. Please check help for config json.");
                                        }
                                    });
                                });

                                tmpStore.forEach(function (obj) {
                                    if (obj.storeItem) {
                                        if (obj.data && obj.data.length > 0) {
                                            obj.data.sort(sortNumber);
                                            util.setItemValue(obj.storeItem, obj.data.join(":"));
                                        } else {
                                            util.setItemValue(obj.storeItem, null);
                                        }

                                    } else {
                                        console.error("storeItem is not defined in config json in types. Please check help for config json.");
                                    }
                                });
                            } else {
                                console.error("types is not defined in config json. Please check help for config json.");
                            }
                        }
                    });

                    if (configJSON.autoExpand2Level > 0) {
                        $(configJSON.regionID).fancytree("getRootNode").visit(function (node) {
                            if (node.getLevel() < configJSON.autoExpand2Level) {
                                node.setExpanded(true);
                            }
                        });
                    }
                    util.loader.stop(configJSON.regionID);
                }

            getData(drawTree);

            // bind dynamic action refresh
            $("#" + regionID.substring(4)).bind("apexrefresh", function () {
                if ($(configJSON.regionID).children('span').length == 0) {
                    getData(updateTree);
                }
            });

            // set timer if auto refresh is set
            if (configJSON.refresh > 0) {
                setInterval(function () {
                    if ($(configJSON.regionID).children('span').length == 0) {
                        getData(updateTree);
                    }
                }, configJSON.refresh * 1000);
            }

        }
    };
})();
