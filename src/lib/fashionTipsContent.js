const fr = {
  title: 'Conseils mode',
  cta: 'Analyser ma tenue',
  nav: 'Conseils',
  profile: {
    heading: 'Mon profil de style',
    intro: "Construit à partir de vos analyses : ce qui vous va bien, et des idées de vêtements portés par des modèles qui vous ressemblent.",
    generate: 'Générer mon profil',
    refresh: 'Mettre à jour mon profil',
    loading: 'Création de votre profil… cela peut prendre environ une minute.',
    noHistory: "Faites d'abord une analyse pour créer votre profil.",
    error: "Impossible de générer le profil pour le moment. Réessayez dans un instant.",
    traits: { skin_tone: 'Teint', undertone: 'Sous-ton', hair: 'Cheveux', body_type: 'Morphologie', style_vibe: 'Style' },
    colors: 'Couleurs qui vous vont',
    cuts: 'Coupes qui vous flattent',
    avoid: 'À éviter',
    picks: 'Pour vous',
  },
  intro: "Quelques bases pour mieux comprendre votre analyse StyleMe et choisir des tenues qui vous mettent en valeur.",
  sections: [
    {
      icon: 'palette',
      heading: 'Les bases de la théorie des couleurs',
      items: [
        { title: 'Connaître votre sous-ton', text: "Une peau à sous-ton chaud (dorée, pêche) s'accorde avec les terracotta, moutarde, olive et camel. Un sous-ton froid (rosé, bleuté) préfère le bleu, l'émeraude, le bordeaux et le gris. Pour tester : des veines vertes indiquent plutôt un sous-ton chaud, des veines bleues un sous-ton froid." },
        { title: 'Le contraste', text: "Si le contraste entre votre peau, vos cheveux et vos yeux est fort, osez les associations tranchées (noir et blanc). S'il est doux, privilégiez les tons sur tons et les nuances adoucies." },
        { title: 'Harmonies faciles', text: "Monochrome (variations d'une même couleur), analogue (couleurs voisines) ou complémentaire (couleurs opposées, comme bleu et orange) : trois règles fiables pour composer une tenue sans faute." },
        { title: 'Les couleurs près du visage', text: "La couleur du haut compte le plus : elle se reflète sur votre teint. Une teinte flatteuse près du visage illumine, une teinte qui ne convient pas peut ternir." },
      ],
    },
    {
      icon: 'shirt',
      heading: 'Silhouette et proportions',
      items: [
        { title: "Marquer la taille", text: "Une ceinture, une veste cintrée ou un haut rentré dessinent la silhouette et équilibrent les proportions." },
        { title: 'Jouer sur les volumes', text: "Associez un volume ample avec une pièce plus ajustée : haut oversize et pantalon fuselé, ou jupe fluide et haut près du corps." },
        { title: "L'encolure", text: "V et décolletés ouverts allongent le visage et le cou. Les cols montants conviennent aux visages plus allongés. Les encolures rondes adoucissent les traits anguleux." },
        { title: 'Longueurs', text: "Une longueur qui s'arrête à l'endroit le plus fin de la jambe (genou, cheville) est plus flatteuse qu'à l'endroit le plus large." },
      ],
    },
    {
      icon: 'sparkles',
      heading: 'Conseils de style au quotidien',
      items: [
        { title: 'La règle des trois couleurs', text: "Limitez-vous à trois couleurs par tenue, neutres compris, pour un rendu harmonieux." },
        { title: 'Investir dans les basiques', text: "Un bon jean, une chemise blanche, un blazer et une paire de baskets propres se marient avec presque tout." },
        { title: 'Le bon ajustement', text: "Un vêtement bien ajusté paraît toujours plus haut de gamme. Une retouche chez le couturier vaut souvent le coup." },
        { title: 'Textures et accessoires', text: "Mélanger les matières (maille, cuir, lin) donne de la profondeur à une tenue neutre. Un accessoire suffit pour la personnaliser." },
      ],
    },
    {
      icon: 'camera',
      heading: "Tirer le meilleur de l'analyse StyleMe",
      items: [
        { title: 'Une photo nette', text: "Prenez-vous en lumière naturelle, visage dégagé et de face. Une bonne lumière donne une analyse plus fidèle de votre teint." },
        { title: 'Le vêtement à plat', text: "Photographiez le vêtement seul, bien visible, sur fond uni, sans plis marqués." },
        { title: 'Comparer plusieurs tenues', text: "Testez plusieurs options et comparez les scores dans votre historique pour repérer les coupes et couleurs qui vous réussissent." },
        { title: 'Un guide, pas une règle', text: "Le score est une aide. Votre confort et vos goûts personnels comptent autant que les règles." },
      ],
    },
  ],
};

const en = {
  title: 'Fashion Tips',
  cta: 'Analyze my outfit',
  nav: 'Tips',
  profile: {
    heading: 'My style profile',
    intro: 'Built from your analyses: what suits you, plus clothing ideas worn by models who look like you.',
    generate: 'Generate my profile',
    refresh: 'Update my profile',
    loading: 'Creating your profile… this can take about a minute.',
    noHistory: 'Run an analysis first to create your profile.',
    error: 'Could not generate your profile right now. Please try again shortly.',
    traits: { skin_tone: 'Skin tone', undertone: 'Undertone', hair: 'Hair', body_type: 'Body type', style_vibe: 'Style' },
    colors: 'Colors that suit you',
    cuts: 'Flattering cuts',
    avoid: 'Avoid',
    picks: 'Picked for you',
  },
  intro: 'A few basics to help you understand your StyleMe analysis and choose outfits that bring out your best.',
  sections: [
    {
      icon: 'palette',
      heading: 'Color theory basics',
      items: [
        { title: 'Know your undertone', text: 'Warm undertones (golden, peachy) suit terracotta, mustard, olive and camel. Cool undertones (rosy, bluish) prefer blue, emerald, burgundy and grey. Quick test: green-looking veins usually mean warm, blue-looking veins cool.' },
        { title: 'Contrast level', text: 'If the contrast between your skin, hair and eyes is high, bold pairings like black and white work well. If it is soft, go for tone-on-tone and muted shades.' },
        { title: 'Easy color harmonies', text: 'Monochrome (shades of one color), analogous (neighboring colors) or complementary (opposites, like blue and orange): three reliable rules for building an outfit.' },
        { title: 'Colors near your face', text: 'The color of your top matters most because it reflects on your skin. A flattering shade brightens you up, an unflattering one can dull your complexion.' },
      ],
    },
    {
      icon: 'shirt',
      heading: 'Silhouette and proportions',
      items: [
        { title: 'Define the waist', text: 'A belt, a tailored jacket or a tucked-in top shapes the silhouette and balances proportions.' },
        { title: 'Play with volume', text: 'Pair something loose with something fitted: an oversized top with slim pants, or a flowy skirt with a close-fitting top.' },
        { title: 'Necklines', text: 'V-necks and open necklines elongate the face and neck. High collars suit longer faces. Round necklines soften angular features.' },
        { title: 'Hem lengths', text: 'A hem that ends at the narrowest part of your leg (knee, ankle) is more flattering than one ending at the widest.' },
      ],
    },
    {
      icon: 'sparkles',
      heading: 'Everyday styling tips',
      items: [
        { title: 'The rule of three colors', text: 'Stick to three colors per outfit, neutrals included, for a cohesive look.' },
        { title: 'Invest in basics', text: 'Good jeans, a white shirt, a blazer and clean sneakers go with almost everything.' },
        { title: 'Fit is everything', text: 'A well-fitted piece always looks more expensive. A quick tailoring job is often worth it.' },
        { title: 'Textures and accessories', text: 'Mixing fabrics (knit, leather, linen) adds depth to a neutral outfit. One accessory is enough to make it yours.' },
      ],
    },
    {
      icon: 'camera',
      heading: 'Getting the most from StyleMe',
      items: [
        { title: 'A clear photo', text: 'Take your photo in natural light, facing the camera with your face visible. Good lighting gives a more accurate read of your skin tone.' },
        { title: 'Lay the garment flat', text: 'Photograph the clothing item alone, fully visible, on a plain background without heavy wrinkles.' },
        { title: 'Compare outfits', text: 'Try several options and compare scores in your history to spot the cuts and colors that work for you.' },
        { title: 'A guide, not a rule', text: 'The score is a helper. Your comfort and personal taste matter as much as any rule.' },
      ],
    },
  ],
};

// Other languages fall back to English until translated.
export function getFashionTips(lang) {
  return lang === 'fr' ? fr : en;
}