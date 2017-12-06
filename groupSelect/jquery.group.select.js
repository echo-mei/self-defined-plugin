/*
 分组选择
 Date：2016-10-31
 Author:chm

 settings 参数说明
 -----
 dataUrl: 填充分组选择框的数据
 singleSelect: true单选 false复选
 maxCount:最大选择数量
 wrapStyle:弹出层位置以及宽高设置
 ------------------------------ */
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        dataUrl: null,
        singleSelect:false,
        maxCount:10,
        modalFlag:false,
        wrapStyle: {
            top: '0',//弹出层的位置
            left: '0',
            width: '800px',//弹出层的宽高
            height: '400px'
        }
    };
    function GruopSelect(ele, opts) {
        this.ele = ele;
        this.opts = opts = $.extend({},defaults, opts);
        this._init();
    }
    GruopSelect.prototype = {
        _init: function () {
            var that = this,$this = this.getElem();
            this.getElem().click(function (e) {
                e.stopPropagation();
                if ($this.siblings(".groupselect").length > 0) {
                    $this.siblings(".groupselect").remove();
                    return false;
                }
                that._render();
            });
        },
        _render: function () {
            var $el = $("<div class='groupselect'> " +
                "<div class='groupselect-title'><b>选择筛选条件</b><span class='tip'>(最多选择"+this.getOpts()["maxCount"]+"项)</span> &nbsp;&nbsp;<span class='tip'></span><a class='close' href='javascript:void(0)'></a></div> " +
                "<div class='groupselect-tag'><dl><dt>已选择：</dt><dd><a href='javascript:void(0)' class='btn'>确定</a></dd></dl></div>" +
                "<div class='groupselect-main'><div class='menu' id='firstMenu'></div><div class='sub-menu' id='secondMenu'><div class='search'><input type='text'><i></i></div></div>"+
                "</div>").css({
                    "top":this.getOpts().wrapStyle.top,
                    "left":this.getOpts().wrapStyle.left,
                    "width":this.getOpts().wrapStyle.width,
                    "height":this.getOpts().wrapStyle.height
            });
            if (this.getOpts().modalFlag){
                $el.css("position","fixed");
            }

            $.extend(this, {
                $el: $el,
                $gpsTitleTip:$el.find(".groupselect-title .tip:eq(1)"),
                $gpsTagDd: $el.find(".groupselect-tag dd"),
                $gpsMenu: $el.find('.groupselect-main .menu'),
                $gpsSubMenu: $el.find('.groupselect-main .sub-menu'),
                $gpsSureBtn: $el.find('.groupselect-tag .btn'),
                $gpsCloseIcon:$el.find('.groupselect-title .close')
            });

            var that = this;
            // 获取下拉数据
            $.get(that.getOpts()["dataUrl"],function(data){
                that._renderMenu(data);
                that.$gpsMenu.find("ul>li:first").trigger("click");
                that.getElem().after(that.$el);
                that._renderMasklayer();
            }) ;

            this._initEvents();
        },
        _renderMenu:function (data) {
            var that = this;
            var $gpsMenuUl = $("<ul></ul>").appendTo(that.$gpsMenu);
            $.each(data,function(i,item){
                $("<li id='"+item["id"]+"'></li>")
                    .text(item["text"])
                    .on("click",function(){
                        $(this).addClass("active")
                            .siblings("li").removeClass("active");
                        that.$gpsSubMenu.find("#subMenu_"+item["id"])
                            .show()
                            .siblings("div.sub-menu-div").hide();
                    })
                    .appendTo($gpsMenuUl);

                // 如果有二级菜单
                if (item["children"] !== undefined){
                    var $subMenuDiv = $("<div class='sub-menu-div' id='subMenu_"+item["id"]+"'></div>").appendTo(that.$gpsSubMenu);
                    $.each(item["children"], function (j, secondItem) {
                        //如果有三级菜单
                        if (secondItem["children"] != undefined){
                            $subMenuDiv.append("<dl id='dl_" + secondItem["id"] + "'></dl>");
                            var $dtItem = $("<dt id='dt_" + secondItem["id"] + "'>" + secondItem["text"] + "</dt>");
                            var $ddItem = $("<dd id='dd_" + secondItem["id"] + "'></dd>");
                            $subMenuDiv.find("dl[id='dl_" + secondItem["id"] + "']").append($dtItem);
                            $subMenuDiv.find("dl[id='dl_" + secondItem["id"] + "']").append($ddItem  );

                            $.each(secondItem["children"], function (k, thridItem) {
                                that._renderSelectBox(thridItem).appendTo($ddItem);
                            });
                        }else {//没有三级菜单，直接渲染二级菜单内容
                            that._renderSelectBox(secondItem).appendTo($subMenuDiv);
                        }
                    });
                }

            }) ;
        },
        _renderSelectBox:function (item) {
                var $selectBox = "";
                var that = this;

                if (!this.getOpts().singleSelect){
                    //复选框
                    $selectBox = $("<a href='javascript:void(0)' id='"+item["id"]+"' class='check-box'></a>")
                                    .text(item["text"])
                                    .on("click",function () {
                                        that._multiSeleToTagDd($(this));
                                    });
                }else {
                    //单选框
                    $selectBox = $("<a href='javascript:void(0)' id='"+item["id"]+"' class='radio-box'></a>")
                                    .text(item["text"])
                                    .on("click",function () {
                                        that._radioSeleToTagDd($(this));
                                    });
                }

                return $selectBox;
        },
        _renderMasklayer:function () {
            console.log(this.getOpts().modalFlag);
            if(this.getOpts().modalFlag){
                $("body").append("<div class='groupselect-masklayer'></div>");
            }
        },
        _initEvents:function () {
            var that= this;
            // 点击确定按钮执行外部自定义事件
            this.$gpsSureBtn.click(function () {
                if (that.getOpts().onClickSure){
                    that.getOpts().onClickSure.call(that);
                    that._destroy();
                }
            });
            //点击关闭按钮关闭弹出层
            this.$gpsCloseIcon.click(function () {
                that._destroy();
            });
            //点击body关闭下拉框弹出层
            $(document).click(function(e){
                if(!that.getOpts().modalFlag){
                    if($(e.target).closest(".groupselect").length==0){
                        that._destroy();
                    }
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
            var $obj = this.$gpsSubMenu.find("#"+id);

            $obj.addClass("selected");
            var $ddItem = $("<a href='javascript:void(0)' id='" + $obj.attr("id") + "' class='check-box selected'>" + $.trim($obj.html()) + "</a>")
                .on("click",function () {
                    that.unSelectItem($(this).attr("id"));
                });
            that.$gpsTagDd.append($ddItem);
        },
        unSelectItem: function (id) {
            this.$gpsSubMenu.find("#"+id).removeClass("selected");
            this.$gpsTagDd.find("#"+id).remove();
        },
        getSelectedItems:function () {
            var result =[];
            this.$gpsTagDd.find("a.selected").each(function (i,item) {
               result.push({"id":$(item).attr("id"),"text":$(item).text()});
            });
            return result;
        },
        _multiSeleToTagDd:function ($obj) {
            if ($obj.hasClass("selected")) {
                this.unSelectItem($obj.attr("id"));
            } else {
                var selectedCount = this.$gpsTagDd.find("a").length - 1;
                if ( selectedCount>= this.getOpts()["maxCount"]) {
                    this.$gpsTitleTip.html("没看到提示吗？最多只能选择" + this.getOpts()["maxCount"] + "项！").css({"color": "red","font-weight":"bold"});
                    setTimeout(function () {
                        this.$gpsTitleTip.empty();
                    }, 3000);
                } else {
                    this.selectItem($obj.attr("id"));
                }
            }
        },
        _radioSeleToTagDd:function ($obj) {
            this.$el.find(".radio-box.selected").removeClass("selected");
            $obj.addClass("selected");
            this.$gpsTagDd.find("a.radio-box").remove();
            var $ddItem = $("<a href='javascript:void(0)' id='" + $obj.attr("id") + "' class='radio-box selected'>" + $.trim($obj.html()) + "</a>");
            this.$gpsTagDd.append($ddItem);
        },
        _destroy: function () {
            this.$el.remove();
            if(this.getOpts().modalFlag){
                $("body").find(".groupselect-masklayer").remove();
            }
        }

    };

    $.fn.gruopSelect = function (opts) {
        return new GruopSelect($(this), opts);
    }

})(jQuery, window, document);