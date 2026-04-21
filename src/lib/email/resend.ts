import { Resend } from "resend";

export async function sendContributionNotification({
  coupleEmail,
  contributorName,
  giftTitle,
  amount,
  message,
  coupleName,
}: {
  coupleEmail: string;
  contributorName: string;
  giftTitle: string;
  amount: number;
  message?: string;
  coupleName: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Yes <notifications@yes-mariage.fr>",
    to: coupleEmail,
    subject: `${contributorName} a participé à votre liste 🎁`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 48px 24px; color: #2c2c2c;">
        <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a89a; margin-bottom: 32px;">
          Yes — Liste de mariage
        </p>
        <h1 style="font-size: 36px; font-weight: 300; line-height: 1.2; margin-bottom: 24px;">
          Une nouvelle participation<br/>
          <em style="color: #9e6b5c;">pour ${coupleName}</em>
        </h1>
        <div style="border-left: 2px solid #f0e6e2; padding-left: 20px; margin: 32px 0;">
          <p style="font-size: 14px; color: #7a7370; margin: 0 0 8px;">Cadeau</p>
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 16px;">${giftTitle}</p>
          <p style="font-size: 14px; color: #7a7370; margin: 0 0 8px;">Montant</p>
          <p style="font-size: 24px; font-weight: 300; margin: 0 0 16px;">${amount}€</p>
          <p style="font-size: 14px; color: #7a7370; margin: 0 0 8px;">De la part de</p>
          <p style="font-size: 18px; font-weight: 500; margin: 0;">${contributorName}</p>
          ${message ? `
          <p style="font-size: 14px; color: #7a7370; margin: 16px 0 8px;">Message</p>
          <p style="font-size: 16px; font-style: italic; color: #2c2c2c; margin: 0;">"${message}"</p>
          ` : ""}
        </div>
        <a href="https://yes-omega-drab.vercel.app/dashboard"
          style="display: inline-block; padding: 14px 32px; background: #2c2c2c; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 16px;">
          Voir mon dashboard →
        </a>
        <p style="font-size: 11px; color: #c9a89a; margin-top: 48px; letter-spacing: 0.2em; text-transform: uppercase;">
          Yes · La liste de mariage qui vous ressemble
        </p>
      </div>
    `,
  });
}

export async function sendContributorConfirmation({
  contributorEmail,
  contributorName,
  giftTitle,
  amount,
  coupleName,
  registrySlug,
}: {
  contributorEmail: string;
  contributorName: string;
  giftTitle: string;
  amount: number;
  coupleName: string;
  registrySlug: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Yes <notifications@yes-mariage.fr>",
    to: contributorEmail,
    subject: `Votre participation a bien été reçue ✓`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 48px 24px; color: #2c2c2c;">
        <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a89a; margin-bottom: 32px;">
          Yes — Liste de mariage
        </p>
        <h1 style="font-size: 36px; font-weight: 300; line-height: 1.2; margin-bottom: 24px;">
          Merci ${contributorName},<br/>
          <em style="color: #9e6b5c;">votre participation est confirmée</em>
        </h1>
        <div style="border-left: 2px solid #f0e6e2; padding-left: 20px; margin: 32px 0;">
          <p style="font-size: 14px; color: #7a7370; margin: 0 0 8px;">Vous avez participé à</p>
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 16px;">${giftTitle}</p>
          <p style="font-size: 14px; color: #7a7370; margin: 0 0 8px;">Pour</p>
          <p style="font-size: 18px; font-weight: 500; margin: 0 0 16px;">${coupleName}</p>
          <p style="font-size: 14px; color: #7a7370; margin: 0 0 8px;">Montant</p>
          <p style="font-size: 24px; font-weight: 300; margin: 0;">${amount}€</p>
        </div>
        <a href="https://yes-omega-drab.vercel.app/mariage/${registrySlug}"
          style="display: inline-block; padding: 14px 32px; background: #2c2c2c; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 16px;">
          Voir la liste →
        </a>
        <p style="font-size: 11px; color: #c9a89a; margin-top: 48px; letter-spacing: 0.2em; text-transform: uppercase;">
          Yes · La liste de mariage qui vous ressemble
        </p>
      </div>
    `,
  });
}
