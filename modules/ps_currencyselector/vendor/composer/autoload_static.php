<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit0e9783df854b5d44f1bf4ba6abf00060
{
    public static $classMap = array (
        'Ps_Currencyselector' => __DIR__ . '/../..' . '/ps_currencyselector.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->classMap = ComposerStaticInit0e9783df854b5d44f1bf4ba6abf00060::$classMap;

        }, null, ClassLoader::class);
    }
}
