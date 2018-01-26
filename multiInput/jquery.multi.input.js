

/*
 多值输入
 Date：2016-10-31
 Author:chm

 settings 参数说明
 -----
 inputOrignalWidth:默认输入值input的宽度
placeholder：默认提示值
 ------------------------------ */
; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        inputOrignalWidth:"50",
        placeholder: 'Enter tag ...'
    };

    function MultiInput(ele, opts) {
        this.ele = ele;
        this.opts = opts = $.extend({},defaults, opts);
        this._init();
    }
    MultiInput.prototype = {
       _init:function () {
            var that = this,
                id = that.ele.attr("id"),
                $el = $("<div class='multi-input-wrap' id='"+id+"_multiInputWrap'>" +
                    "<ol class='mi-list'></ol>" +
                    "<span class='mi-placeholder'>"+that.opts.placeholder+"</span>" +
                    "<input type='text' class='mi-input' maxlength='30'>" +
                    "</div>");

            $.extend(this, {
                $el: $el,
                $multiList: $el.find('.mi-list'),
                $multiPlaceholder: $el.find('.mi-placeholder'),
                $multiInput: $el.find('.mi-input')
            });
            that.ele.css("visibility","hidden");
            that.ele.after(that.$el);
            that._initEvents();
        },
       _initEvents: function () {
            var that = this;
            console.log(this);
            that.$el.click(function () {
                that._unfold();
                that.$multiPlaceholder.hide();
                that.$multiInput.show().focus();
                that.$multiList.removeClass('inputBlur').addClass('inputFocus');
            });
            //输入input点击enter键新增一个查询条目
            that.$multiInput.bind('keydown', function (e) {
                var key = e.which;
                that._resizeInput();
                if (key == 13) {
                    $(this).blur();
                    $(this).focus();
                }
            });
            //输入input失焦
            that.$multiInput.bind('blur', function (e) {
                e.preventDefault();
                var itemVal=$(this).val();
                that.$multiInput.width(that.opts.inputOrignalWidth);
                if(itemVal.length==0 || itemVal.replace(/^\s+$/gi, "").length ==0){
                    return false;
                }else{
                    that.$multiList.append("<li><span>"+itemVal+"</span><span class='mi-remove'>"+"×"+"</span></li>");
                    $(this).val('');
                    that._getValue(that.ele);
                }
            });
            //点击删除当前的条目
            that.$el.on("click",".mi-list li .mi-remove",function(e){
                e.preventDefault();
                $(this).parent("li").remove();
                that._getValue(that.ele);
            });
            //点击空白地方姓名查询收起
            $("body").mousedown(function(e){
                e.stopPropagation();
                if($(e.target).closest(".multi-input-wrap").length==0){
                    that._fold();
                }
            });
        },
       _resizeInput:function () {
            var $multiInput = this.$multiInput,
                textWidth,
                inputWidth = this.opts.inputOrignalWidth;
            textWidth = this._textWidth($multiInput.val() + 30);
            $multiInput.width(Math.max(textWidth, inputWidth));
        },
       _textWidth: function(text){//判断输入文本的宽度
            var sensor = $('<pre>'+ text +'</pre>').css({display: 'none'});
            $('body').append(sensor);
            var width = sensor.width();
            sensor.remove();
            return width;
        },
        _fold:function () {
            this.$el.css({
                "height": '30px',
                "z-index":3
            });
            this.$multiPlaceholder.show();
        },
        _unfold:function () {
            this.$el.css({
                "height": 'auto',
                "overflow":"hidden",
                "z-index":99
            });
        },
        _getValue: function($this){
            var value="",
                $li = this.$multiList.children("li");
            $li.each(function(i,li){
                value = value+$(li).children("span:first").text()+",";
            });
            this.ele.val(value.substring(0,value.length-1));
        }
    };
    $.fn.multiInput = function (opts) {
        return new MultiInput($(this), opts);
    }
})(jQuery);