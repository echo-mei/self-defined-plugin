/*
 多选下拉树
 Date：2016-10-31
 Author:chm

 settings 参数说明
 -----
 dataUrl: 填充下拉框数据Url
 data:填充下拉框数据
 valueField:传入数据中存储id的json标签值
 textField:传入数据中存储text的json标签值
 delFlag:选中值到页面后页面显示形式为可删除
 isShowAllSelect:全选按钮是否显示
 idSaveEle:选中的数据id值存储位置(页面上是隐藏的input框)
 ------------------------------ */
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        dataUrl: null,
        data:null,
        valueField:"value",
        textField:"text",
        isShowAllSelect:false,
        idSaveEle:null,
        delFlag:false,
        onLoadSuccess:null
    };

    function Dropdown(ele, opts) {
        this.ele = ele;
        this.opts = opts = $.extend({},defaults, opts);
        this._init();
    }
    Dropdown.prototype = {
        _init: function () {
            var that = this,$this = this.getElem();
            that._render();
            that.getElem().click(function (e) {
                e.stopPropagation();
                if (that.$el.is(":hidden")) {
                    that.$el.show();
                }else {
                    that.$el.hide();
                }
            });
        },
        _render: function () {
            var that = this;
            var $el = $("<div class='dropdown-multiple' style='display: none;'> " +
                "<div class='dropdown-main'></div> " +
                "<div class='dropdown-btn'> " +
                    "<button type='button' class='clear'>清除</button>" +
                    "<button type='button' class='select-all'>全选</button>" +
                    "<button type='button' class='sure'>确定</button> " +
                "</div> " +
                "</div>");

            $.extend(this, {
                $el: $el,
                $dpMain: $el.find('.dropdown-main'),
                $dpAllSelectBtn: $el.find('.allSelect'),
                $dpSureBtn: $el.find('.sure'),
                $dpSelectAllBtn: $el.find('.select-all'),
                $dpClearBtn: $el.find('.clear')
            });
            if(that.getOpts().isShowAllSelect){
                that.$dpAllSelectBtn.show();
            }else {
                that.$dpAllSelectBtn.hide();
            }

            that.$el.width(that.getElem().width());

            if (that.getOpts().dataUrl){
                // 获取下拉数据
                $.get(that.getOpts()["dataUrl"],function(data){
                	// 转成json格式
                	data = eval(data);
                    that.opts.data = data;
                    that.getElem().siblings(".dropdown-multiple").remove();
                    $.each(that.getOpts().data,function(i,item){
                        that._renderCheckboxItem(item) ;
                    }) ;
                    that.getElem().after(that.$el);

                    //点开获取默认选中项
                    that.defaultSelectedItems(that.getOpts().idSaveEle.val());

                    if(that.getOpts().onLoadSuccess){
                        that.getOpts().onLoadSuccess.call(that);
                    }
                }) ;
            }

            that._initEvents();
        },
        _renderCheckboxItem: function (data) {
            var that = this ;

            var item = $("<a class='check-box ellipsis' id='"+data[this.getOpts()['valueField']]+"' title='"+data[this.getOpts()['textField']]+"'></a>")
                .text(data[this.getOpts()['textField']])
                .on("click",function(){
                    var $this = $(this);
                    if ($this.hasClass("selected")){
                        that.unSelectItem($this.attr("id"));
                    }else {
                        that.selectItem($this.attr("id"));
                    }
                })
                .appendTo(this.$dpMain) ;
        },
        _setValue:function(){
        	var result = this.getSelectedItems();
            //将选中元素的text值存入目标元素
        	this.getElem().val(result.value);
            //将选中元素的id值存入id存放元素
        	this.getOpts().idSaveEle.val(result.id);
        },
        _initEvents:function () {
            var that= this;

            // 点击确定按钮
            that.$dpSureBtn.mousedown(function (e) {
                var result = that.getSelectedItems();
                //将选中元素的text值存入目标元素
                that.getElem().val(result.value);
                //将选中元素的id值存入id存放元素
                that.getOpts().idSaveEle.val(result.id);
                that._hide();
            });
            //点击全选按钮
            that.$dpSelectAllBtn.click(function (e) {
               e.stopPropagation();
               that.$dpMain.find(".check-box").each(function () {
                   that.selectItem($(this).attr("id"));
               });
               var result = that.getSelectedItems();
                //将选中元素的text值存入目标元素
                that.getElem().val(result.value);
                //将选中元素的id值存入id存放元素
                that.getOpts().idSaveEle.val(result.id);

            });
            // 点击清除按钮
            that.$dpClearBtn.click(function () {
                //将下拉框中选中元素样式清除
                that.unSelectAll();
                //将选中元素的text值置为空存入目标元素
                that.getElem().val("");
                //将选中元素的id值置为空存入id存放元素
                that.getOpts().idSaveEle.val("");
            });
            //点击body关闭下拉框弹出层
            $("body").mousedown(function(e){
                if($(e.target).closest(".dropdown-multiple").length==0){
                    that._hide();
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
            this.$dpMain.find("#"+id).addClass("selected");
        },
        unSelectItem: function (id) {
            this.$dpMain.find("#"+id).removeClass("selected");
        },
        unSelectAll: function () {
            this.$dpMain.find("a").removeClass("selected");
        },
        selectAll: function () {
            this.$dpMain.find("a.check-box:not(.selected)").addClass("selected");
        },
        getSelectedItems:function () {
            var result ={"id":"","value":""};
            this.$dpMain.find("a.selected").each(function (i,item) {
                result.id += $(this).attr("id")+",";
                result.value += $(this).text()+",";
            });
            result.id = result.id.substring(0,result.id.length-1);
            result.value = result.value.substring(0,result.value.length-1);
            return result;
        },
        defaultSelectedItems:function (id) {
            if (id != undefined && id != ""){
                var idArray = id.split(',');
                for (var i = 0; i < idArray.length; i++) {
                    this.selectItem(idArray[i]);
                }
            }
            this._setValue();
        },
        _hide: function () {
            this.$el.hide();
        }
        
    };
   
    
    $.fn.dropdown = function (opts) {
        return new Dropdown($(this), opts);
    }

})(jQuery, window, document);