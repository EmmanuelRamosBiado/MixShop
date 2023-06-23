<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitc0a8d6fe6b2362e062e770597489c0e7
{
    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'PrestaShop\\Module\\LinkList\\' => 27,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'PrestaShop\\Module\\LinkList\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
    );

    public static $classMap = array (
        'PrestaShop\\Module\\LinkList\\Adapter\\ObjectModelHandler' => __DIR__ . '/../..' . '/src/Adapter/ObjectModelHandler.php',
        'PrestaShop\\Module\\LinkList\\Cache\\LegacyLinkBlockCache' => __DIR__ . '/../..' . '/src/Cache/LegacyLinkBlockCache.php',
        'PrestaShop\\Module\\LinkList\\Cache\\LinkBlockCacheInterface' => __DIR__ . '/../..' . '/src/Cache/LinkBlockCacheInterface.php',
        'PrestaShop\\Module\\LinkList\\Controller\\Admin\\Improve\\Design\\LinkBlockController' => __DIR__ . '/../..' . '/src/Controller/Admin/Improve/Design/LinkBlockController.php',
        'PrestaShop\\Module\\LinkList\\Core\\Grid\\Definition\\Factory\\LinkBlockDefinitionFactory' => __DIR__ . '/../..' . '/src/Core/Grid/Definition/Factory/LinkBlockDefinitionFactory.php',
        'PrestaShop\\Module\\LinkList\\Core\\Grid\\LinkBlockGridFactory' => __DIR__ . '/../..' . '/src/Core/Grid/LinkBlockGridFactory.php',
        'PrestaShop\\Module\\LinkList\\Core\\Grid\\Query\\LinkBlockQueryBuilder' => __DIR__ . '/../..' . '/src/Core/Grid/Query/LinkBlockQueryBuilder.php',
        'PrestaShop\\Module\\LinkList\\Core\\Search\\Filters\\LinkBlockFilters' => __DIR__ . '/../..' . '/src/Core/Search/Filters/LinkBlockFilters.php',
        'PrestaShop\\Module\\LinkList\\DataMigration' => __DIR__ . '/../..' . '/src/DataMigration.php',
        'PrestaShop\\Module\\LinkList\\Filter\\BestSalesRouteFilter' => __DIR__ . '/../..' . '/src/Filter/BestSalesRouteFilter.php',
        'PrestaShop\\Module\\LinkList\\Filter\\LinkFilter' => __DIR__ . '/../..' . '/src/Filter/LinkFilter.php',
        'PrestaShop\\Module\\LinkList\\Filter\\RouteFilterInterface' => __DIR__ . '/../..' . '/src/Filter/RouteFilterInterface.php',
        'PrestaShop\\Module\\LinkList\\Form\\ChoiceProvider\\AbstractDatabaseChoiceProvider' => __DIR__ . '/../..' . '/src/Form/ChoiceProvider/AbstractDatabaseChoiceProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\ChoiceProvider\\CMSCategoryChoiceProvider' => __DIR__ . '/../..' . '/src/Form/ChoiceProvider/CMSCategoryChoiceProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\ChoiceProvider\\CMSPageChoiceProvider' => __DIR__ . '/../..' . '/src/Form/ChoiceProvider/CMSPageChoiceProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\ChoiceProvider\\CategoryChoiceProvider' => __DIR__ . '/../..' . '/src/Form/ChoiceProvider/CategoryChoiceProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\ChoiceProvider\\HookChoiceProvider' => __DIR__ . '/../..' . '/src/Form/ChoiceProvider/HookChoiceProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\ChoiceProvider\\PageChoiceProvider' => __DIR__ . '/../..' . '/src/Form/ChoiceProvider/PageChoiceProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\LinkBlockFormDataProvider' => __DIR__ . '/../..' . '/src/Form/LinkBlockFormDataProvider.php',
        'PrestaShop\\Module\\LinkList\\Form\\Type\\CustomUrlType' => __DIR__ . '/../..' . '/src/Form/Type/CustomUrlType.php',
        'PrestaShop\\Module\\LinkList\\Form\\Type\\LinkBlockType' => __DIR__ . '/../..' . '/src/Form/Type/LinkBlockType.php',
        'PrestaShop\\Module\\LinkList\\Form\\Type\\TranslateCustomUrlType' => __DIR__ . '/../..' . '/src/Form/Type/TranslateCustomUrlType.php',
        'PrestaShop\\Module\\LinkList\\LegacyLinkBlockRepository' => __DIR__ . '/../..' . '/src/LegacyLinkBlockRepository.php',
        'PrestaShop\\Module\\LinkList\\Model\\LinkBlock' => __DIR__ . '/../..' . '/src/Model/LinkBlock.php',
        'PrestaShop\\Module\\LinkList\\Model\\LinkBlockLang' => __DIR__ . '/../..' . '/src/Model/LinkBlockLang.php',
        'PrestaShop\\Module\\LinkList\\Presenter\\LinkBlockPresenter' => __DIR__ . '/../..' . '/src/Presenter/LinkBlockPresenter.php',
        'PrestaShop\\Module\\LinkList\\Repository\\LinkBlockRepository' => __DIR__ . '/../..' . '/src/Repository/LinkBlockRepository.php',
        'Ps_Linklist' => __DIR__ . '/../..' . '/ps_linklist.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitc0a8d6fe6b2362e062e770597489c0e7::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitc0a8d6fe6b2362e062e770597489c0e7::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitc0a8d6fe6b2362e062e770597489c0e7::$classMap;

        }, null, ClassLoader::class);
    }
}
