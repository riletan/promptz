import { ImageResponse } from "next/og";
import { ServerSideAppsyncRepository } from "@/repositories/ServerSideAppsyncRepository";

export const alt = "PROMPTZ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const repository = new ServerSideAppsyncRepository();

export default async function Image({ params }: { params: { id: string } }) {
  const prompt = await repository.getPrompt(params.id);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f141a",
          padding: "40px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                fontWeight: 600,
                color: "#E6EDF3",
                width: "75%",
                lineHeight: 1.2,
              }}
            >
              {prompt.name}
            </h1>
            <img
              src="https://promptz.dev/images/amazon-q.png"
              width="120"
              alt="Amazon Q Developer Logo"
            ></img>
          </div>
          <p
            style={{
              fontSize: "24px",
              color: "#7D8590",
              width: "75%",

              lineHeight: 1.4,
            }}
          >
            {prompt.description}
          </p>
          <p
            style={{
              fontSize: "24px",
              color: "#7D8590",
              width: "75%",

              lineHeight: 1.4,
            }}
          >
            👤 {prompt.createdBy()}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
