<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit67c6c9f13486c5e572d461ce03bd4550
{
    public static $classMap = array (
        'AdminPsThemeCustoAdvancedController' => __DIR__ . '/../..' . '/controllers/admin/AdminPsThemeCustoAdvanced.php',
        'AdminPsThemeCustoConfigurationController' => __DIR__ . '/../..' . '/controllers/admin/AdminPsThemeCustoConfiguration.php',
        'ThemeCustoRequests' => __DIR__ . '/../..' . '/classes/ThemeCustoRequests.php',
        'ps_themecusto' => __DIR__ . '/../..' . '/ps_themecusto.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->classMap = ComposerStaticInit67c6c9f13486c5e572d461ce03bd4550::$classMap;

        }, null, ClassLoader::class);
    }
}
