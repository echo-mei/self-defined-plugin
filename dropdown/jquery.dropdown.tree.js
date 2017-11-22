/*
 多选下拉树
 Date：2016-10-31
 Author:chm

 settings 参数说明
 -----
 zNodesUrl: 填充下拉树的数据地址
 treeSettings:下拉树的传入参数，使用ztree构造树结构
 idSaveEle:选中的数据id值存储位置(页面上是隐藏的input框)
 ------------------------------ */
;(function ($) {
    $.fn.dropdownTree = function (options) {
        var defaults = {
            zNodesUrl: null,
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
                    showIcon:false,
                    fontCss: getFontCss
                },
                callback: {
                    beforeClick: beforeClick
                }
            },
            idSaveEle:null
        };
        var opts = $.extend({},defaults, options);

        var $this = $(this);//目标控件---也就是想要点击后弹出树形菜单的那个控件
        var $idSaveEle = opts.idSaveEle;
        var id = $this.attr("id");//目标控件id
        var toshow = id+"_wrap";//要显示的层的id
        var treeId = id+"_tree";//要加载数据的树

        $this.click(function () {
            if ($this.siblings(".dropdown-multiple").length > 0) {
                $this.siblings(".dropdown-multiple").remove();
            }else {
                //下拉多选树外层div
                var $dpTreeWrap = $("<div id='" + id + "_wrap' class='dropdown-multiple'></div>").width($this.width());
                //下拉多选树外层查询栏
                var $dpTreeSearch = $("<div class='dropdown-search'><input type='text' id='" + id + "_input'/><i></i></div>");
                var $dpTreeMain = $("<div class='dropdown-main'></div>");
                //下拉多选树树结构
                var $dpTree = $("<ul class='ztree' id='" + id + "_tree'></ul>");
                $dpTree.appendTo($dpTreeMain);
                //下拉多选树确定按钮区
                var $dpTreeBtn = $("<div class='dropdown-btn'><button type='button' id='" + id + "_Clearbtn'>清除</button><button type='button' id='" + id + "_Surebtn'>确定</button></div>");
                $dpTreeWrap.append($dpTreeSearch,$dpTreeMain,$dpTreeBtn);
                $this.after($dpTreeWrap);

                //给树列表设置值
                $.get(opts.zNodesUrl,function(data) {
                    $.fn.zTree.init($dpTree, opts.treeSettings, data);
                    setShowData();
                });


                //点击确定给文本框赋值
                $dpTreeBtn.find("#" + id + "_Surebtn").click(function (e) {
                    var treeObj = $.fn.zTree.getZTreeObj(treeId),
                        nodes = treeObj.getCheckedNodes(true),
                        v = "",
                        id = "";
                    for (var i = 0; i < nodes.length; i++) {
                        v += nodes[i].name + ",";
                        id += nodes[i].id + ",";
                    }
                    v = v.substring(0,v.length-1);
                    id = id.substring(0,id.length-1);
                    $this.val(v);
                    $idSaveEle.val(id);
                    $dpTreeWrap.remove();
                });

                //点击清除按钮将选中的元素清空
                $dpTreeBtn.find("#" + id + "_Clearbtn").click(function (e) {
                    // 取消当前所有被选中节点的选中状态
                    var treeObj = $.fn.zTree.getZTreeObj(treeId);
                    var nodes = treeObj.getCheckedNodes();
                    for (var i=0, l=nodes.length; i < l; i++) {
                        treeObj.checkNode(nodes[i], false, false);
                    }
                    $this.val("");
                    $idSaveEle.val("");
                });
                //搜索框查询定位
                $dpTreeSearch.find("#" + id + "_input").keyup(function () {
                    changeColor(treeId,$(this).val());
                });

                //点击body关闭弹出层
                $(document).mousedown(function(e){
                    if($(e.target).closest(".dropdown-multiple").length==0){
                        $dpTreeWrap.remove();
                    }
                });

            }

        });
        //设置的值
        function setShowData() {
            if ($idSaveEle.val() != undefined && $idSaveEle.val() != "") {
                var checked_id = $idSaveEle.val();
                var checkedidArray = checked_id.split(',');
                var treeObj = $.fn.zTree.getZTreeObj(treeId),treeNode = "";
                for (var i = 0; i < checkedidArray.length; i++) {
                    treeNode=treeObj.getNodeByParam("id", checkedidArray[i]);
                    treeObj.checkNode(treeNode, true, false);
                }
            }
        }

        var nodeList = [];
        var treeId;
        function changeColor(id,value){
            treeId = id;
            updateNodes(false);
            if(value != ""){
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                nodeList = treeObj.getNodesByParamFuzzy("name", value);
                if(nodeList && nodeList.length>0){
                    updateNodes(true);
                }
            }
        }
        function updateNodes(highlight) {
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            for( var i=0; i<nodeList.length; i++) {
                nodeList[i].highlight = highlight;
                treeObj.updateNode(nodeList[i]);
            }
        }

        function getFontCss(treeId, treeNode) {
            return (!!treeNode.highlight) ? {color:"#1cc6a3", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"};
        }
        function beforeClick(treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            zTree.checkNode(treeNode, !treeNode.checked, null, true);
            return false;
        }

    };
})(jQuery);