import { resolve } from 'path';

export const root = resolve(__dirname, '..', '..');
export const uploads = resolve(__dirname, '..', '..', 'uploads');
export const clientPath = resolve(__dirname, '..', '..', 'client');
export const dist = resolve(__dirname, '..', '..', 'client', 'dist');
export const publicPath = resolve(__dirname, '..', '..', 'client', 'public');
export const fonts = resolve(__dirname, '..', '..', 'client', 'public', 'fonts');
export const assets = resolve(__dirname, '..', '..', 'client', 'public', 'assets');
export const imageOutput = resolve(__dirname, '..', '..', 'client', 'public', 'images');
export const structuredTools = resolve(__dirname, '..', 'app', 'clients', 'tools', 'structured');
export const pluginManifest = resolve(__dirname, '..', 'app', 'clients', 'tools', 'manifest.json');
