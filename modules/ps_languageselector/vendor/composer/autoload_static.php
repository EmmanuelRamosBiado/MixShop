<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInite386ccbf0f2c11e97c852ab2f3adafcf
{
    public static $classMap = array (
        'Ps_Languageselector' => __DIR__ . '/../..' . '/ps_languageselector.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->classMap = ComposerStaticInite386ccbf0f2c11e97c852ab2f3adafcf::$classMap;

        }, null, ClassLoader::class);
    }
}