<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit463e363c7e0b8e2f50774cfac8c98739
{
    public static $classMap = array (
        'Ps_MainMenu' => __DIR__ . '/../..' . '/ps_mainmenu.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->classMap = ComposerStaticInit463e363c7e0b8e2f50774cfac8c98739::$classMap;

        }, null, ClassLoader::class);
    }
}
