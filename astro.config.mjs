// @ts-check
import { defineConfig} from 'astro/config';
import Cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    adapter: Cloudflare()
});