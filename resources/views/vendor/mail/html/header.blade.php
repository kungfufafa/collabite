@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
<img src="{{ asset('logo.svg') }}" class="logo" alt="{{ config('app.name') }}">
<span class="brand-wordmark">{{ config('app.name') }}</span>
</a>
</td>
</tr>
