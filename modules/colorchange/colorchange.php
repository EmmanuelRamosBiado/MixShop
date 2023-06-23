<?php
/**
 * 2007-2014 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * No redistribute in other sites, or copy.
 *
 * @author    RSI <rsi_2004@>
 * @copyright 2007-2017 RSI
 * @license   RSI
 */

class Colorchange extends Module
{
    public function __construct()
    {
        $this->name = 'colorchange';
        $this->module_key = '87ff021027afb6fca84abb85f8b875a1';
        if (_PS_VERSION_ > "1.4.0.0") {
            $this->tab = 'administration';
            $this->author = 'RSI';
            $this->need_instance = 1;
        }
        if (_PS_VERSION_ < "1.4.0.0") {
            $this->tab = 'Tools';
            $this->author = 'RSI';
            $this->need_instance = 1;
        }
        if (_PS_VERSION_ > '1.6.0.0') {
            $this->tab = 'administration';
            $this->author = 'RSI';
            $this->bootstrap = true;
        }
				/*$this->currencies = true;
		$this->currencies_mode = 'checkbox';*/
        $this->version = '3.1.0';
        if (_PS_VERSION_ < '1.5') {
            require(_PS_MODULE_DIR_.$this->name.'/backward_compatibility/backward.php');
        }


        parent::__construct();

        $this->displayName = $this->l('Color change');
        $this->description = $this->l('Change color of the theme');
        $path = dirname(__FILE__);
        if (strpos(__FILE__, 'Module.php') !== false) {
            $path .= '/../modules/'.$this->name;
        }
    }

    public function install()
    {
        if (!parent::install() or !$this->registerHook('header') or !$this->registerHook(
            'top'
        ) or !$this->registerHook('leftColumn')
        ) {
            return false;
        }

        if (!Configuration::updateValue(
            'CHANGECOLOR_B',''

        ) && Configuration::updateValue(
            'CHANGECOLOR_B',
            ''
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_FONT','Noto Sans,sans-serif'

        ) && Configuration::updateValue(
            'CHANGECOLOR_FONT',
            'Noto Sans,sans-serif'
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_SOCIAL',''

        ) && Configuration::updateValue(
            'CHANGECOLOR_SOCIAL',
            ''
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_EBC',false

        ) && Configuration::updateValue(
            'CHANGECOLOR_EBC',
            false
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_B1',''

        ) && Configuration::updateValue(
            'CHANGECOLOR_B1',
            ''
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_SOCIALPAGE',''

        ) && Configuration::updateValue(
            'CHANGECOLOR_SOCIALPAGE',
            ''
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_B2',''

        ) && Configuration::updateValue(
            'CHANGECOLOR_B2',
            ''
        )
        ) {
            return false;
        }
        if (!Configuration::updateValue(
            'CHANGECOLOR_B3',''

        ) && Configuration::updateValue(
            'CHANGECOLOR_B3',
            ''
        )
        ) {
            return false;
        }

        return true;
    }

    public function uninstall()
    {
        if (!parent::uninstall()) {
            return false;
        }
        $deleteall = Db::getInstance()
              ->ExecuteS('SELECT * FROM `'._DB_PREFIX_.'configuration` WHERE name LIKE \'%CHANGECOLOR%\'');
        while ($reg = mysql_fetch_array($deleteall)) {
            Db::getInstance()
              ->ExecuteS(
                  'DELETE FROM `'._DB_PREFIX_.'configuration` WHERE id_configuration = '.$reg['id_configuration']
              );
        }
        return true;
    }

  public function getContent()
    {
        $errors = '';
        if (_PS_VERSION_ < '1.5.0.0') {


        } else {
            return $this->postProcess().$this->_displayInfo().$this->renderForm().$this->renderFont().$this->_displayAdds();
        }
    }


    private function _displayInfo()
    {
        return $this->display(
            __FILE__,
            'views/templates/hook/infos.tpl'
        );
    }

    public function postProcess()
    {
        $errors = '';
        $output = '';
        if (Tools::isSubmit('submitform')) {
            Configuration::updateValue('CHANGECOLOR_FONT', Tools::getValue('font2'));
$fff = Tools::getValue('font2');
            if ($fff == null) {
                $fff = 'Noto Sans,sans-serif';
            }
            Configuration::updateValue('CHANGECOLOR_FONTSIZE', Tools::getValue('fontsize'));
$fsize = Tools::getValue('fontsize');
            if ($fsize == null) {
                $fsize = 1;
            }
            @chmod(
                '../modules/colorchange/views/css/'.((_PS_VERSION_ > '1.5.0.0') ? $this->context->shop->id : '').'chf.css',
                0777
            );
            $xml2 = fopen(
                '../modules/colorchange/views/css/'.((_PS_VERSION_ > '1.5.0.0') ?
                    $this->context->shop->id : '').'chf.css',
                'w'
            );
            $ff2 = str_replace('+',' ',$fff);
            fwrite(
                $xml2,
                '
@import url(\'//fonts.googleapis.com/css?family='.$fff.'\');
body{font-family:'.$ff2.'; font-size:'.$fsize.'rem}
    ');
    
    $output .= $this->displayConfirmation($this->l('Settings updated').'<br/>');
return $output;
        }
        if (Tools::isSubmit('submitUpdate')) {
            Configuration::updateValue('CHANGECOLOR_B', Tools::getValue('b'));
            Configuration::updateValue('CHANGECOLOR_B1', Tools::getValue('b1'));
		    Configuration::updateValue('CHANGECOLOR_B2', Tools::getValue('b2'));
		    Configuration::updateValue('CHANGECOLOR_B3', Tools::getValue('b3'));
		    Configuration::updateValue('CHANGECOLOR_L', Tools::getValue('l'));
			Configuration::updateValue('CHANGECOLOR_C', Tools::getValue('c'));
			Configuration::updateValue('CHANGECOLOR_W', Tools::getValue('w'));
			Configuration::updateValue('CHANGECOLOR_F', Tools::getValue('f'));
			Configuration::updateValue('CHANGECOLOR_H', Tools::getValue('h'));
			Configuration::updateValue('CHANGECOLOR_P', Tools::getValue('p'));
			Configuration::updateValue('CHANGECOLOR_PP', Tools::getValue('pp'));
			Configuration::updateValue('CHANGECOLOR_CA', Tools::getValue('ca'));
            Configuration::updateValue('CHANGECOLOR_N', Tools::getValue('n'));
            Configuration::updateValue('CHANGECOLOR_EBC', Tools::getValue('ebc'));
			Configuration::updateValue('CHANGECOLOR_REPEAT', Tools::getValue('repeat'));
            Configuration::updateValue('CHANGECOLOR_SOCIAL', Tools::getValue('social'));
			Configuration::updateValue('CHANGECOLOR_CCC', Tools::getValue('ccc'));
            Configuration::updateValue('CHANGECOLOR_SOCIALPAGE', Tools::getValue('socialpage'));
            Configuration::updateValue('CHANGECOLOR_BACK', Tools::getValue('backoption'));

            if (isset($_FILES['backi']) && isset($_FILES['backi']['tmp_name']) && !empty($_FILES['backi']['tmp_name'])) {
                if ($error = ImageManager::validateUpload(
                    $_FILES['backi'],
                    Tools::convertBytes(ini_get('upload_max_filesize'))
                )
                ) {
                    $errors .= $error;
                } else {
                    // Set the image name with a name contextual to the shop context
                    $this->adv_imgname = 'back';
                    if (Shop::getContext() == Shop::CONTEXT_GROUP) {
                        $this->adv_imgname = 'back.jpg';
                    } elseif (Shop::getContext() == Shop::CONTEXT_SHOP) {
                        $this->adv_imgname = 'back.jpg';
                    }
                    // Copy the image in the module directory with its new name
                    if (!move_uploaded_file(
                        $_FILES['backi']['tmp_name'],
                        _PS_MODULE_DIR_.$this->name.'/views/img/'.$this->adv_imgname
                    )
                    ) {
                        $errors .= $this->l('File upload error.');
                    }
                }
            }
            $bimagee = '';
            if (Tools::getValue('ebc') == true){
                $bimagee = 'background-image: url(../img/back.jpg);';
            } else {
                $bimagee = '';

            }
            //$this->Writecss($textsize2, $shadow, $color3, $color1);
            $output .= $this->displayConfirmation($this->l('Settings updated').'<br/>');
  @chmod(
                '../modules/colorchange/views/css/'.((_PS_VERSION_ > '1.5.0.0') ? $this->context->shop->id : '').'ch.css',
                0777
            );
            $xml2 = fopen(
                '../modules/colorchange/views/css/'.((_PS_VERSION_ > '1.5.0.0') ?
                    $this->context->shop->id : '').'ch.css',
                'w'
            );

            fwrite(
                $xml2,
                '
.product-images>li.thumb-container>.thumb.selected, .product-images>li.thumb-container>.thumb:hover{border: 3px solid '.Tools::getValue('b').'!important;}
.dropdown .expand-more, #header .header-nav .currency-selector{color: '.Tools::getValue('n').'!important}
/*buton*/

.btn-primary {
    color: '.Tools::getValue('b2').'!important;
    background-color: '.Tools::getValue('b').'!important;
}
.btn-primary.disabled.focus, .btn-primary.disabled:focus, .btn-primary.disabled:hover, .btn-primary:disabled.focus, .btn-primary:disabled:focus, .btn-primary:disabled:hover {
    background-color: '.Tools::getValue('b').'!important;
    border-color: transparent;
}
.btn-primary.focus, .btn-primary:focus, .btn-primary:hover,.tag-primary[href]:focus, .tag-primary[href]:hover  { background-color: '.Tools::getValue('b1').'!important;}

.btn-outline-primary.active, .btn-outline-primary.focus, .btn-outline-primary:active, .btn-outline-primary:focus, .btn-outline-primary:hover, .open>.btn-outline-primary.dropdown-toggle {
    color: '.Tools::getValue('b2').'!important;
    background-color: '.Tools::getValue('b').'!important;
    border-color: #2fb5d2;
}
.dropdown-item.active, .dropdown-item.active:focus, .dropdown-item.active:hover {
    color: '.Tools::getValue('b2').'!important;
    text-decoration: none;
    background-color: '.Tools::getValue('b').'!important;
    outline: 0;
}
.nav-pills .nav-item.open .nav-link, .nav-pills .nav-item.open .nav-link:focus, .nav-pills .nav-item.open .nav-link:hover, .nav-pills .nav-link.active, .nav-pills .nav-link.active:focus, .nav-pills .nav-link.active:hover {
    color: '.Tools::getValue('b2').'!important;
    cursor: default;
    background-color: '.Tools::getValue('b').'!important;
}
.card-primary {
    background-color: '.Tools::getValue('b').'!important;
    border-color: #2fb5d2;
}
.page-item.active .page-link, .page-item.active .page-link:focus, .page-item.active .page-link:hover {
    z-index: 2;
    color: '.Tools::getValue('b2').'!important;
    cursor: default;
    background-color: '.Tools::getValue('b').'!important;
    border-color: #2fb5d2;
}
.tag-primary {
    background-color: '.Tools::getValue('b').'!important;
}
.list-group-item.active, .list-group-item.active:focus, .list-group-item.active:hover {
    z-index: 2;
    color: '.Tools::getValue('b2').'!important;
    text-decoration: none;
    background-color: '.Tools::getValue('b').'!important;
    border-color: #2fb5d2;
}
.custom-radio input[type=radio]:checked+span {
    background-color: '.Tools::getValue('b').'!important;

}
.block-social li:hover {
    background-color: '.Tools::getValue('b').'!important;
}
.tabs .nav-tabs .nav-link.active, .tabs .nav-tabs .nav-link:hover {
    border: none;
    border-bottom: 3px solid '.Tools::getValue('b').'!important;
}
.tabs .nav-tabs .nav-link.active {
    color: '.Tools::getValue('b').'!important;
}
a, #footer .h1,#footer .h2,#footer .h3, .block-contact .block-contact-title, .linklist .blockcms-title a {
    color: '.Tools::getValue('l').'!important;
    text-decoration: none;
}
#header .header-nav .cart-preview.active {
    background: '.Tools::getValue('c').'!important;
}
/*prices*/
.product-price, .cart-summary-line .value,#products .product-price-and-shipping, .featured-products .product-price-and-shipping, .product-accessories .product-price-and-shipping, .product-miniature .product-price-and-shipping{
 color: '.Tools::getValue('p').'!important;
	}
/*wrapper*/
#wrapper,.product-customization .product-message,.search-widget form input[type=text], .block_newsletter form input[type=text] {
    background-color: '.Tools::getValue('w').'!important;

}
#wrapper{
    background-color: '.Tools::getValue('w').'!important;
    '.$bimagee.'

    background-repeat:'.Tools::getValue('backoption').'!important;
}
.tag-default {
    background: '.Tools::getValue('w').'!important;
}
.bootstrap-touchspin .btn-touchspin:hover {
    background-color: '.Tools::getValue('w').'!important;
}
body#checkout .modal-content {
    background-color: '.Tools::getValue('w').'!important;
}
.block-social li:hover {
    background-color: '.Tools::getValue('w').'!important;
}
#footer {
    background-color: '.Tools::getValue('f').'!important;
}
#header {
    background: '.Tools::getValue('h').'!important;
}
/*blocks*/
#search_filters, #search_filters_brands, #search_filters_suppliers, .block-categories, .card{
	  background: '.Tools::getValue('b3').'!important;
	}
#products .product-description, .featured-products .product-description, .product-accessories .product-description, .product-miniature .product-description, #products .thumbnail-container, .featured-products .thumbnail-container, .product-accessories .thumbnail-container, .product-miniature .thumbnail-container
{
	    background: '.Tools::getValue('pp').'!important;
}
#header .header-nav .cart-preview.active i, #header .header-nav .cart-preview.active a{color:'.Tools::getValue('ca').'!important}
.block-social  li{background:'.Tools::getValue('social').'!important;}
.facebook.icon-gray,.twitter.icon-gray,.googleplus.icon-gray,.pinterest.icon-gray {
    background-color:  '.Tools::getValue('socialpage').'!important;
}
#wrapper .container{background-color: '.Tools::getValue('ccc').'}

	');

                return $output;
        }
    }

    public function getConfigFieldsValues()
    {

    $fields_values = array(
			'b' => Tools::getValue('b', Configuration::get('CHANGECOLOR_B')),
			'b1' => Tools::getValue('b1', Configuration::get('CHANGECOLOR_B1')),
			'b2' => Tools::getValue('b2', Configuration::get('CHANGECOLOR_B2')),
			'b3' => Tools::getValue('b3', Configuration::get('CHANGECOLOR_B3')),
			'l' => Tools::getValue('l', Configuration::get('CHANGECOLOR_L')),
            'c' => Tools::getValue('c', Configuration::get('CHANGECOLOR_C')),
			'c' => Tools::getValue('ccc', Configuration::get('CHANGECOLOR_CCC')),
			'w' => Tools::getValue('w', Configuration::get('CHANGECOLOR_W')),
			'f' => Tools::getValue('f', Configuration::get('CHANGECOLOR_F')),
			'h' => Tools::getValue('h', Configuration::get('CHANGECOLOR_H')),
			'p' => Tools::getValue('p', Configuration::get('CHANGECOLOR_P')),
			'pp' => Tools::getValue('pp', Configuration::get('CHANGECOLOR_PP')),
			'ca' => Tools::getValue('ca', Configuration::get('CHANGECOLOR_CA')),
			'ccc' => Tools::getValue('ccc', Configuration::get('CHANGECOLOR_CCC')),
            'n' => Tools::getValue('n', Configuration::get('CHANGECOLOR_N')),
            'ebc' => Tools::getValue('ebc', Configuration::get('CHANGECOLOR_EBC')),
			'backoption' => Tools::getValue('backoption', Configuration::get('CHANGECOLOR_BACK')),
            'social' => Tools::getValue('social', Configuration::get('CHANGECOLOR_SOCIAL')),
            'socialpage' => Tools::getValue('socialpage', Configuration::get('CHANGECOLOR_SOCIALPAGE')),
        );
        return $fields_values;
    }

    public function renderForm()
    {

        ToolsCore::clearCache();
        $options1 = array(
            array(
                'id_option' => 'repeat',
                // The value of the 'value' attribute of the <option> tag.
                'name' => $this->l('repeat')
                // The value of the text content of the  <option> tag.
            ),
            array(
                'id_option' => 'repeat-x',
                'name' => $this->l('repeat-x')
            ),
            array(
                'id_option' => 'repeat-y',
                'name' => $this->l('repeat-y')
            ),
            array(
                'id_option' => 'no-repeat',
                'name' => $this->l('no-repeat')
            ),
        );
        $options2 = array(
            array(
                'id_option' => true,
                // The value of the 'value' attribute of the <option> tag.
                'name' => $this->l('yes')
                // The value of the text content of the  <option> tag.
            ),
            array(
                'id_option' => false,
                'name' => $this->l('no')
            ),
        );
        $this->bacimage = Tools::getMediaServer($this->name)._MODULE_DIR_.$this->name.'/views/img/back.jpg';
        $token = Tools::getAdminTokenLite('AdminModules');
        $back = $this->context->link->getAdminLink('AdminModules', false).'&configure='.$this->name.'&tab_module='.$this->tab.'&module_name='.$this->name.'&token='.$token;
        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Configuration'),
                    'icon' => 'icon-image'
                ),
                'input' => array(
                    array(
                        'type' => 'color',
                        'label' => $this->l('Buttons color / tabs'),
                        'name' => 'b',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Button hover color'),
                        'name' => 'b1',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Button text color'),
                        'name' => 'b2',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Blocks background color'),
                        'name' => 'b3',

                    ),
                    array(
                        'type' => 'color',
                        'label' => $this->l('Center column color'),
                        'name' => 'ccc',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Link color'),
                        'name' => 'l',

                    ),
                    array(
                        'type' => 'color',
                        'label' => $this->l('Social icons color'),
                        'name' => 'social',

                    ),
                    array(
                        'type' => 'color',
                        'label' => $this->l('Social icons product page'),
                        'name' => 'socialpage',

                    ),

 array(
                        'type' => 'color',
                        'label' => $this->l('Cart color'),
                        'name' => 'c',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Cart text/icon color'),
                        'name' => 'ca',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Wrappers / page background color'),
                        'name' => 'w',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Header color'),
                        'name' => 'h',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Top nav links color'),
                        'name' => 'n',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Footer color'),
                        'name' => 'f',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Prices color'),
                        'name' => 'p',

                    ),
 array(
                        'type' => 'color',
                        'label' => $this->l('Products block color'),
                        'name' => 'pp',

                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Enable Background image'),
                        'name' => 'ebc',
                        'options' => array(
                            'query' => $options2,
                            'id' => 'id_option',
                            'name' => 'name'
                        )
                    ),
                    array(
                        'type' => 'file',
                        'label' => $this->l('Body Background image'),
                        'name' => 'backi',
                        'desc' => $this->l('upload a background image (jpg format)'),
                        'thumb' => $this->context->link->protocol_content.$this->bacimage,
                        'size' => 100
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Background image repeat'),
                        'name' => 'backoption',
                        'options' => array(
                            'query' => $options1,
                            'id' => 'id_option',
                            'name' => 'name'
                        )
                    ),

                ),

                'buttons' => array(
                    'cancelBlock' => array(
                        'title' => $this->l('Cancel'),
                        'href' => $back,
                        'icon' => 'process-icon-cancel'
                    )
                ),
                'submit' => array(
                    'title' => $this->l('Save'),
                )

            ),
        );
        $helper = new HelperForm();
        $helper->show_toolbar = true;
        $helper->table = $this->table;
        $lang = new Language((int)Configuration::get('PS_LANG_DEFAULT'));
        $helper->default_form_language = $lang->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') ? Configuration::get(
            'PS_BO_ALLOW_EMPLOYEE_FORM_LANG'
        ) : 0;
        $this->fields_form = array();
        $helper->module = $this;
        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submitUpdate';
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false).'&configure='.$this->name.'&tab_module='.$this->tab.'&module_name='.$this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->tpl_vars = array(
            'fields_value' => $this->getConfigFieldsValues(),
            'languages' => $this->context->controller->getLanguages(),
            'id_language' => $this->context->language->id
        );
        return $helper->generateForm(array($fields_form));
    }

    private function _displayAdds()
    {
        $this->context->smarty->assign(
            array(
                'psversion' => _PS_VERSION_
            )
        );
        return $this->display(
            __FILE__,
            'views/templates/hook/adds.tpl'
        );
    }
    private function renderFont()
    {
        $this->context->smarty->assign(
            array(
                'psversion' => _PS_VERSION_,
                'server' => $_SERVER['REQUEST_URI'],
                'fonts' => Configuration::get('CHANGECOLOR_FONT'),
                'fsize' => Configuration::get('CHANGECOLOR_FONTSIZE'),

            )
        );
        return $this->display(
            __FILE__,
            'views/templates/hook/font.tpl'
        );
    }


    public function hookTop($params)
    {
      /*  $titlelw = Configuration::get('PROMOCIONES_TITLE',$this->context->language->id);

        $psversion = _PS_VERSION_;
        $this->context->smarty->assign(
            array(
                'titlelw' => $titlelw,
                'default_lang' => (int)$this->context->language->id,
                'id_lang' => $this->context->language->id
            )
        );

            return $this->display(
                __FILE__,
                'views/templates/front/legalwarning.tpl'
            );
     */

    }

    public function hookHeader()
    {
		 $this->context->controller->registerStylesheet(
                'modules-color',
                'modules/'.$this->name.'/views/css/'.((_PS_VERSION_ > '1.5.0.0') ?
                    $this->context->shop->id : '').'chf.css',
                array('position' => 'top', 'priority' => 159)
            );
        $this->context->controller->registerStylesheet(
                'modules-color2',
                'modules/'.$this->name.'/views/css/'.((_PS_VERSION_ > '1.5.0.0') ?
                    $this->context->shop->id : '').'ch.css',
                array('position' => 'top', 'priority' => 160)
            );
       /* $redirectlw = Configuration::get('LEGALWARNING_TWITTERU');
        $stylelw = Configuration::get('LEGALWARNING_HOOK');
        $facebookuhc = Configuration::get('LEGALWARNING_FACEBOOKU');
        $top = Configuration::get('LEGALWARNING_TOP');
        $llang = Configuration::get('LEGALWARNING_LANG');
        $widthlw = Configuration::get('LEGALWARNING_WIDTH');
        $heightlw = Configuration::get('LEGALWARNING_HEIGHT');
        $psversion = _PS_VERSION_;
        $languageshc = Language::getLanguage($this->context->language->id);
        $lang = Tools::strtolower(Language::getIsoById($this->context->language->id));
        $lang2 = Language::getLanguage($this->context->language->id);

        /*	Tools::addCSS(($this->_path).'assets/css/styles.css', 'all');*/
      /*  $this->context->smarty->assign(
            array(
                'redirectlw' => $redirectlw,
                'lang' => $lang,
                'llang' => $llang,
                'widthlw' => $widthlw,
                'heightlw' => $heightlw,
                'fullurl' => (isset($_SERVER['HTTPS']) ? "https" : "http")."://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]",
                'topas' => $top,
                'stylelw' => $stylelw,
                'psversion' => $psversion,

                'lang2' => $lang2,
                'facebookuhc' => $facebookuhc
            )
        );
*/
        return $this->display(
            __FILE__,
            'views/templates/front/header.tpl'
        );
    }
}
