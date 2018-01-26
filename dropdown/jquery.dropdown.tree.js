/*
 多选下拉树
 Date：2016-10-31
 Author:chm

 settings 参数说明
 -----
 zNodesUrl:填充下拉树的数据的url
 zNodes: 填充下拉树的数据
 treeSettings:下拉树的传入参数，使用ztree构造树结构
 idSaveEle:选中的数据id值存储位置(页面上是隐藏的input框)
 onLoadSuccess:加载成功后执行的函数
 ------------------------------ */
; (function ($, window, document, undefined) {
    "use strict";
    var beforeClick = function(treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        zTree.checkNode(treeNode, !treeNode.checked, null, true);
        return false;
    };
    var defaults = {
        zNodesUrl: null,
        zNodes:null,
        className:'normal',
        treeSettings:{
            check: {
                enable: true,
                chkboxType: { "Y": "", "N": "" }
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view:{
                showIcon:false
            },
            callback: {
                beforeClick: beforeClick
            }
        },
        idSaveEle:null,
        onLoadSuccess:null
    };

    function DropdownTree(ele, opts) {
        this.ele = ele;
        this.opts = opts = $.extend(true,{},defaults, opts);
        this._init();
    }
    DropdownTree.prototype = {
        _init: function () {
            var that = this,$this = this.ele;
            that._render();
            that.ele.click(function (e) {
                e.stopPropagation();
                if (that.$el.is(":hidden")) {
                    that.$el.show();
                }else {
                    that.$el.hide();
                }
            });
        },
        _render:function () {
            var that = this,
                id = that.ele.attr("id"),
                $el = $("<div id='" + id + "_wrap' class='dropdown-multiple "+that.opts.className+"'>" +
                    "<div class='dropdown-search'><input type='text' class='search-input'/><i></i></div>" +
                    "<div class='dropdown-main'><ul class='ztree' id='"+ id +"_tree'></ul></div>" +
                    "<div class='dropdown-btn'>" +
                        "<button type='button' class='clear-btn'>清除</button>" +
                        "<button type='button' class='sure-btn'>确定</button>" +
                    "</div>" +
                    "</div>").width(that.ele.outerWidth(true));

            $.extend(this, {
                $el: $el,
                $dpTreeSearchInput: $el.find('.search-input'),
                $dpTreeSearchIcon: $el.find('.dropdown-search i'),
                $dpTreeUl: $el.find('#'+id+'_tree'),
                $dpTreeSureBtn: $el.find('.sure-btn'),
                $dpTreeClearBtn: $el.find('.clear-btn')
            });

            if (that.opts.zNodesUrl){
                //给树列表设置值
                $.get(that.opts.zNodesUrl,function(data) {
                    // 转成json格式
                    data = eval(data);
                    that.opts.zNodes = data;
                    $.fn.zTree.init(that.$dpTreeUl, that.opts.treeSettings, that.opts.zNodes);
                    that.ele.after(that.$el);
                    that._setDefaultShowData();
                    if(that.opts.onLoadSuccess){
                        that.opts.onLoadSuccess.call(that);
                    }
                });
            }

            that._initEvents();
        },
        _initEvents:function () {
            var that= this;
            // 点击确定按钮
            that.$dpTreeSureBtn.click(function (e) {
                e.stopPropagation();
                var treeId = that.$dpTreeUl.attr("id"),
                    treeObj = $.fn.zTree.getZTreeObj(treeId),
                    nodes = treeObj.getCheckedNodes(true),
                    v = "",
                    id = "";
                for (var i = 0; i < nodes.length; i++) {
                    v += nodes[i].name + ",";
                    id += nodes[i].id + ",";
                }
                v = v.substring(0,v.length-1);
                id = id.substring(0,id.length-1);
                that.ele.val(v);
                that.opts.idSaveEle.val(id);
                that._hide();
            });
            // 点击清除按钮
            that.$dpTreeClearBtn.click(function (e) {
                e.stopPropagation();
                // 取消当前所有被选中节点的选中状态
                var treeId = that.$dpTreeUl.attr("id"),
                    treeObj = $.fn.zTree.getZTreeObj(treeId),
                    nodes = treeObj.getCheckedNodes();
                for (var i=0, l=nodes.length; i < l; i++) {
                    treeObj.checkNode(nodes[i], false, false);
                }
                that.ele.val("");
                that.opts.idSaveEle.val("");
            });
            //点击body关闭下拉框弹出层
            $("body").mousedown(function(e){
                if($(e.target).closest(".dropdown-multiple").length==0){
                    that._hide();
                }
            });
        },
        _setDefaultCheckData:function () {
            var $idSaveEle = this.opts.idSaveEle,
                treeId = this.$dpTreeUl.attr("id");
            if ($idSaveEle.val() != undefined && $idSaveEle.val() != "") {
                var checked_id = $idSaveEle.val();
                var checkedidArray = checked_id.split(',');
                var treeObj = $.fn.zTree.getZTreeObj(treeId),treeNode = "";
                if(treeObj != null){
                    for (var i = 0; i < checkedidArray.length; i++) {
                        treeNode=treeObj.getNodeByParam("id", checkedidArray[i]);
                        treeObj.checkNode(treeNode, true, false);
                    }
                }

            }
        },
        _setDefaultShowData:function () {
            this._setDefaultCheckData();
            this.$dpTreeSureBtn.click();
        },
        _hide:function () {
            this.$el.hide();
        }

    };
    $.fn.dropdownTree = function (opts) {
        return new DropdownTree($(this), opts);
    }
})(jQuery);