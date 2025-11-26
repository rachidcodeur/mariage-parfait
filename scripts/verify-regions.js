// Script de vérification des régions et départements
// Note: Ce script nécessite que le fichier regions.ts soit compilé ou converti en JS
// Pour l'instant, vérification manuelle

const regionsList = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur',
];

const expectedSlugs = [
  'auvergne-rhone-alpes',
  'bourgogne-franche-comte',
  'bretagne',
  'centre-val-de-loire',
  'grand-est',
  'hauts-de-france',
  'ile-de-france',
  'normandie',
  'nouvelle-aquitaine',
  'occitanie',
  'pays-de-la-loire',
  'provence-alpes-cote-dazur',
];

function regionToSlug(regionName) {
  return regionName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/î/g, 'i')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/à/g, 'a')
    .replace(/ô/g, 'o');
}

console.log('Vérification des slugs des régions:\n');
regionsList.forEach((region, index) => {
  const slug = regionToSlug(region);
  const expected = expectedSlugs[index];
  const match = slug === expected;
  console.log(`${match ? '✓' : '✗'} ${region}`);
  console.log(`  Slug généré: ${slug}`);
  console.log(`  Slug attendu: ${expected}`);
  if (!match) {
    console.log(`  ⚠️  INCOHÉRENCE DÉTECTÉE!`);
  }
  console.log('');
});

console.log('\nTotal des régions:', regionsList.length);
console.log('Total des slugs attendus:', expectedSlugs.length);

