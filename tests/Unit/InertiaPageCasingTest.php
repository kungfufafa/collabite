<?php

declare(strict_types=1);

test('inertia pages are tracked with production casing', function (): void {
    $root = dirname(__DIR__, 2);
    $expectedPaths = inertiaPagePathsRenderedByBackend($root);

    foreach ($expectedPaths as $path) {
        $absolutePath = $root.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path);

        expect($absolutePath)->toBeFile();
    }

    $output = [];
    $exitCode = 0;

    exec('git -C '.escapeshellarg($root).' ls-files -- resources/js/pages', $output, $exitCode);

    if ($exitCode !== 0) {
        $this->markTestSkipped('Git metadata is unavailable.');
    }

    sort($output);
    sort($expectedPaths);

    expect($output)->toContain(...$expectedPaths);
});

/**
 * @return list<string>
 */
function inertiaPagePathsRenderedByBackend(string $root): array
{
    $componentNames = [];
    $directories = ['app', 'routes'];

    foreach ($directories as $directory) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($root.DIRECTORY_SEPARATOR.$directory),
        );

        foreach ($iterator as $file) {
            if (! $file->isFile() || $file->getExtension() !== 'php') {
                continue;
            }

            preg_match_all(
                '/Inertia::render\(\s*["\']([^"\']+)["\']/',
                (string) file_get_contents($file->getPathname()),
                $matches,
            );

            foreach ($matches[1] as $componentName) {
                $componentNames[$componentName] = true;
            }
        }
    }

    return array_map(
        fn (string $componentName): string => "resources/js/pages/{$componentName}.tsx",
        array_keys($componentNames),
    );
}
