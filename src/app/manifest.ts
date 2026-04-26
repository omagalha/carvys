import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Carvys',
    short_name:       'Carvys',
    description:      'Gerencie seu estoque, leads e pós-venda em um só lugar.',
    start_url:        '/app/dashboard',
    display:          'standalone',
    background_color: '#0A0A0F',
    theme_color:      '#C8F135',
    icons: [
      {
        src:     '/icon.png',
        sizes:   '32x32',
        type:    'image/png',
      },
      {
        src:     '/apple-icon.png',
        sizes:   '180x180',
        type:    'image/png',
      },
    ],
  }
}
