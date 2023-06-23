{*
* 2007-2014 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2014 PrestaShop SA
*  @license    http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*}

 <!--<script src="//ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js"></script>-->
    <link rel="stylesheet" type="text/css" href="{$module_dir}views/css/fontselect.css" />
    <script src="{$module_dir}views/js/jquery.fontselect.js"></script>
    <script>
      $(function(){
        $('#font').fontselect().change(function(){
          // replace + signs with spaces for css
          var font = $(this).val().replace(/\+/g, ' ');
          
          // split font into family and weight
          font = font.split(':');
          
          // set family on paragraphs 
          $('p').css('font-family', font[0]);
          $('#font2').val(font[0]);
        });
      });
    </script>
<div class="bootstrap panel">
	<div class="panel-heading">
		<i class="icon-picture-o"></i> {l s="Fonts"}
	</div>



<form  action="{$server|escape:'htmlall':'UTF-8'}" method="post" enctype="multipart/form-data">

<label>{l s='Font size' mod='colorchange'}</label>
<input type="text" name="fontsize" value="{$fsize}">
<p class="help-block">{l s='Set the value for font size, only numbers and is in REM, like 1, 0.5, 1.1' mod='colorchange'}</p><br/>

{l s='Selected font (select inherit to use default font)' mod='colorchange'}: {$fonts}<br/>
<input id="font2" id="font2" name="font2" type="hidden" value=""/>
    <input id="font" name="font2" type="text" value="{$fonts}"/>
 
       

    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
     Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
     when an unknown printer took a galley of type and scrambled it to make a type 
     specimen book. It has survived not only five centuries, but also the leap into
     electronic typesetting, remaining essentially unchanged. It was popularised 
     in the 1960s with the release of Letraset sheets containing Lorem Ipsum 
     passages, and more recently with desktop publishing software like Aldus 
     PageMaker including versions of Lorem Ipsum.</p>


 <input type="submit" name="submitform" value="{l s='Save' mod='colorchange'}" class="btn button" />

 
 </form>
</div>
