const ENDPOINT = 'https://style-me-your-ai-fashion-companio-2945c724.base44.app/functions/brandApi';

const EXAMPLES = [
  {
    title: 'Lister les articles',
    code: `curl -X POST ${ENDPOINT} \\
  -H "x-api-key: sm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"action":"products","limit":20}'`,
  },
  {
    title: 'Lancer un essayage',
    code: `curl -X POST ${ENDPOINT} \\
  -H "x-api-key: sm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"action":"tryon","productId":"123456","personImage":"https://.../client.jpg"}'`,
  },
  {
    title: 'Relire un résultat',
    code: `curl -X POST ${ENDPOINT} \\
  -H "x-api-key: sm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"action":"status","jobId":"..."}'`,
  },
];

export default function BrandDocs() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 bg-card/60 text-sm text-muted-foreground space-y-2">
        <p>Appelez l'API <b>depuis le serveur de votre site</b> (jamais depuis le navigateur) avec l'en-tête <code>x-api-key</code>. Toutes les requêtes sont en POST JSON.</p>
        <p><code>personImage</code> : URL https ou image base64 au format <code>data:image/jpeg;base64,...</code> (6 Mo max).</p>
        <p>L'essayage est généré dans la requête (comptez 20 à 60 secondes) et renvoie <code>resultUrl</code> (lien temporaire) et les informations d'achat de l'article (<code>purchase_url</code>, <code>price</code>, <code>available</code>). Erreurs : 401 clé invalide, 404 article inconnu, 409 indisponible, 429 quota atteint.</p>
      </div>
      {EXAMPLES.map((e) => (
        <div key={e.title} className="glass rounded-2xl p-5 bg-card/60">
          <p className="font-bold mb-2">{e.title}</p>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">{e.code}</pre>
        </div>
      ))}
    </div>
  );
}