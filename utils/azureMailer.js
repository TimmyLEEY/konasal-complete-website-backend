import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

// Load env variables
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const senderEmail = process.env.AZURE_SENDER_EMAIL;

// ✅ Create credential
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

// ✅ Create Graph client
const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await credential.getToken("https://graph.microsoft.com/.default");
      return token.token;
    },
  },
});

export async function sendAzureEmail(to, subject, htmlContent) {
  const message = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: htmlContent,
      },
      toRecipients: [
        {
          emailAddress: { address: to },
        },
      ],
      from: {
        emailAddress: { address: senderEmail },
      },
    },
    saveToSentItems: "true",
  };

  await graphClient.api(`/users/${senderEmail}/sendMail`).post(message);
}
