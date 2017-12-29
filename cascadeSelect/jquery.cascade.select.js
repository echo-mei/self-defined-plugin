/*
 分组选择
 Date：2016-10-31
 Author:chm

 settings 参数说明
 -----
 dataUrl: 填充级联选择框的数据
 singleSelect: true单选 false复选
  maxCount:10最多选择10项
 ------------------------------ */
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        dataUrl: null,
        singleSelect:false,
        maxCount:10,
        idSaveEle:null
    };
    function CascadeSelect(ele, opts) {
        this.ele = ele;
        this.opts = opts = $.extend({},defaults, opts);
        this._init();
    }
    CascadeSelect.prototype = {
        _init: function () {
            var that = this,$this = this.getElem();
            this.getElem().click(function (e) {
                e.stopPropagation();
                if ($this.siblings(".cascadeselect").length > 0) {
                    $this.siblings(".cascadeselect").remove();
                    return false;
                }
                that._render();
            });
        },
        _render: function () {
            var that = this,
                $el = $("<div class='cascadeselect'>" +
                        "<div class='cascadeselect-result'>" +
                            "<p class='over-tips'></p><label>已选择<span class='tip'>(最多选择"+this.getOpts().maxCount+"项)</span>:</label>" +
                            "<div class='contents'></div></div>" +
                        "<div class='cascadeselect-main clearfix'></div>" +
                        "<div class='cascadeselect-btn'> " +
                            "<button type='button' class='clear'>清除</button>" +
                            "<button type='button' class='sure'>确定</button> " +
                        "</div>" +
                        "</div>");

            $.extend(this, {
                $el: $el,
                $casMain:$el.find(".cascadeselect-main"),
                $casResultCont:$el.find(".cascadeselect-result .contents"),
                $casResultTip:$el.find(".cascadeselect-result .over-tips"),
                $casClearBtn:$el.find("button.clear"),
                $casSureBtn:$el.find("button.sure")
            });

            // 获取下拉数据
            $.get(that.getOpts()["dataUrl"],function(data){
                that._renderOrignalResult();
                that._renderMenu(data,0);
                that.getElem().after(that.$el);
            }) ;

            this._initEvents();
        },
        _renderOrignalResult:function () {
            var id = this.getOpts().idSaveEle.val().split(","),
                value = this.getElem().val().split(","),
                that = this;

            if (id != "" && value != ""){
                for (var i=0;i<id.length-1;i++){
                    var $aItem = $("<a href='javascript:void(0)' id='" + id[i] + "' class='check-box selected'>" +value[i]+ "</a>")
                        .on("click",function (e) {
                            e.stopPropagation();
                            that.unSelectItem($(this).attr("id"));
                        });
                    that.$casResultCont.append($aItem);
                }
            }

        },
        _renderMenu:function (data,num) {
            var that = this,$casUl,resultItems;

            that.$el.find("ul").each(function (i) {
               if (i>num-1)
                   $(this).remove();
            });

           $casUl = $("<ul></ul>").appendTo(that.$casMain);

            $.each(data,function(i,item){
                // 如果有二级菜单
                if (item["children"] !== undefined){
                    $("<li id='"+item["id"]+"'></li>")
                        .text(item["text"])
                        .on("click",function(e){
                            e.stopPropagation();
                            $(this).addClass("active")
                                .siblings("li").removeClass("active");
                            that._renderMenu(item["children"],num+1);

                            var ulNum = that.$casMain.find("ul").length,cascadeselectWidth=0;
                            that.$casMain.find("ul").each(function (i) {
                                cascadeselectWidth += $(this).width()+1;
                                console.log(cascadeselectWidth,$(this).width());
                            });

                            that.$el.width(cascadeselectWidth);
                        })
                        .appendTo($casUl);
                }else {
                    $casUl.width(250);
                    that._renderSelectBox(item).appendTo($casUl);
                }
            }) ;

            //选中的勾上
            resultItems = that.getSelectedItems();
            for (var i in resultItems){
                var id = resultItems[i].id;
                $casUl.find("a[id="+id+"]").addClass("selected");
            }
        },
        _renderSelectBox:function (item) {
            var $selectBox = "",that = this;

            if (!this.getOpts().singleSelect){
                //复选框
                $selectBox = $("<a href='javascript:void(0)' id='"+item["id"]+"' class='check-box ellipsis'  title='"+item["text"]+"'></a>")
                    .text(item["text"])
                    .on("click",function (e) {
                        e.stopPropagation();
                        that._multiSeleToResult($(this));
                    });
            }else {
                //单选框
                $selectBox = $("<a href='javascript:void(0)' id='"+item["id"]+"' class='radio-box ellipsis' title='"+item["text"]+"'></a>")
                    .text(item["text"])
                    .on("click",function (e) {
                        e.stopPropagation();
                    });
            }

            return $selectBox;
        },
        _initEvents:function () {
            var that= this;
            // 点击确定按钮执行外部自定义事件
            this.$casSureBtn.click(function () {
                var result = that.getSelectedItems(),id="",value="";

                for (var i in result){
                    id += result[i].id+",";
                    value += result[i].text+",";
                }

                //将选中元素的text值存入目标元素
                that.getElem().val(value);
                //将选中元素的id值存入id存放元素
                that.getOpts().idSaveEle.val(id);
                that._destroy();
            });
            // 点击清除筛选去掉全部选中项
            this.$casClearBtn.click(function () {
                that.unSelectALL();
                that.$casSureBtn.click();
            });

            //点击body关闭下拉框弹出层
            $(document).click(function(e){
                if($(e.target).closest("div.cascadeselect").length==0){
                    that._destroy();
                }
            });
        },
        getElem: function () {
            return this.ele ;
        },
        getOpts: function () {
            return this.opts;
        },
        selectItem: function (id) {
            var that = this;
            var $obj = this.$casMain.find("#"+id);

            $obj.addClass("selected");
            var $aItem = $("<a href='javascript:void(0)' id='" + $obj.attr("id") + "' class='check-box selected'>" + $.trim($obj.html()) + "</a>")
                .on("click",function (e) {
                    e.stopPropagation();
                    that.unSelectItem($(this).attr("id"));
                });
            that.$casResultCont.append($aItem);
        },
        unSelectItem: function (id) {
            this.$casResultCont.find("#"+id).remove();
            this.$casMain.find("#"+id).removeClass("selected");
        },
        getSelectedItems:function () {
            var result =[];
            this.$casResultCont.find("a.selected").each(function (i,item) {
                result.push({"id":$(item).attr("id"),"text":$(item).text()});
            });
            return result;
        },
        unSelectALL:function () {
            var that = this;
            this.$casResultCont.find("a.selected").remove();
        },
        _multiSeleToResult:function ($obj) {
            if ($obj.hasClass("selected")) {
                this.unSelectItem($obj.attr("id"));
            } else {
                var selectedCount = this.$casResultCont.find("a").length - 1;
                if ( selectedCount>= this.getOpts()["maxCount"]) {
                    this.$casResultTip.html("没看到提示吗？最多只能选择" + this.getOpts()["maxCount"] + "项！").css({"color": "red","font-weight":"bold","display":"block"});
                    setTimeout(function () {
                        this.$gpsTitleTip.empty();
                    }, 3000);
                } else {
                    this.selectItem($obj.attr("id"));
                }
            }
        },
        _destroy: function () {
            this.$el.remove();
        }

    };

    $.fn.cascadeSelect = function (opts) {
        return new CascadeSelect($(this), opts);
    }

})(jQuery, window, document);