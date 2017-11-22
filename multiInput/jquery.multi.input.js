

/*
 多值输入
 Date：2016-11-01
 Author:chm
 ------------------------------ */
;(function ($) {
    $.fn.multiInput = function (options) {

        return this.each(function () {
            var $this = $(this); //指向当前的input
            var $thisParentDd = $(this).parent(); //指向当前input的父级dd

            var x = $thisParentDd.offset();

            if ($this.siblings("#multiInputWrap").length>0){
                $this.siblings("#multiInputWrap").remove();
            }

            var originalWidth = $this.width();
            $this.css("visibility","hidden");
            var $multiInputWrap = $("<div class='multi-input-wrap' id='multiInputWrap'><ol class='mi-list'></ol><input type='text' class='mi-input' maxlength='8'></div>")
                                    .insertAfter($this)
                                    .width(originalWidth);
            var $multiList = $multiInputWrap.find("ol.mi-list");
            var $multiInput = $multiInputWrap.find("input.mi-input");

            $multiInputWrap.click(function () {
                $(this).css({"height": '110px',"overflow":"auto"});
                $multiInput.show().focus();
                $multiList.removeClass('inputBlur').addClass('inputFocus');
            });

            //输入input点击enter键新增一个查询条目
            $multiInput.bind('keydown', function (e) {
                var key = e.which;
                if (key == 13) {
                    e.preventDefault();
                    var itemVal=$(this).val();
                    if(itemVal.length==0 || itemVal.replace(/^\s+$/gi, "").length ==0){
                        return false;
                    }else{
                        $multiList.append("<li><span>"+itemVal+"</span><span class='mi-remove'>"+"×"+"</span></li>");
                        $(this).val('');
                    }
                }
            });

            //点击删除当前的条目
            $multiInputWrap.on("click",".mi-list li .mi-remove",function(e){
                e.preventDefault();
                $(this).parent("li").remove();
            });

            //点击空白地方姓名查询收起
            $(document).click(function(e){
                e.stopPropagation();
                var clickEle = $(e.target).attr('id');
                if (clickEle == "multiInputWrap") {
                    return false;
                }
                $multiInputWrap.find("input.mi-input").hide();
                $multiInputWrap.css({"height": '28px'});
            });

        });
    };
})(jQuery);