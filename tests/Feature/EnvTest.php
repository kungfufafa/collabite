<?php

test('env', function () {
    file_put_contents('env_out.txt', 'APP_ENV: '.config('app.env')."\nSESSION_DRIVER: ".config('session.driver')."\nAPP_URL: ".config('app.url')."\n");
    expect(true)->toBeTrue();
});
