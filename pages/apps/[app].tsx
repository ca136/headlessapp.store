import builder, { BuilderComponent } from "@builder.io/react";
import { GetStaticPaths, GetStaticProps } from "next";
import React, { useState } from "react";
import { GetApp } from "../../components/GetApp";
import Layout from "../../components/Layout";
import { AppInfo } from "../../interfaces/app";

type Props = {
  app?: AppInfo;
  errors?: string;
};

const AppPage = ({ app, errors }: Props) => {
  const [showBuilderDrawer, setShowBuilderDrawer] = useState(false);

  if (errors) {
    return (
      <Layout title="Error | Next.js + TypeScript Example">
        <p>
          <span className="text-red-800">Error:</span> {errors}
        </p>
      </Layout>
    );
  }

  return (
    <Layout title={`${app?.data?.title || ""} | HeadlessApp.Store`}>
      <style>{`
        .monaco-editor .margin, .monaco-editor, .monaco-editor-background, .monaco-editor .inputarea.ime-input {
          background-color: transparent !important;
        }
      `}</style>

      <div className="p-16 bg-white shadow-md full-width">
        <div className="container mx-auto">
          <div className="flex">
            <img
              src={app?.data.image}
              className="w-60 h-40 rounded bg-white mr-20 self-center object-contain object-center shadow-lg"
            />
            <div>
              <h2 className="text-6xl">{app?.data.title}</h2>
              <p className="text-gray-700 mt-6">{app?.data.subtitle}</p>

              <div className="flex-row mt-10">
                <a href="#get-app-code" className="btn-primary-lg">
                  Get app
                </a>
                <button
                  className="text-primary ml-5"
                  onClick={() => {
                    setShowBuilderDrawer(true);
                  }}
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {app && (
        <GetApp
          onCloseDrawer={() => setShowBuilderDrawer(false)}
          showBuilderDrawer={showBuilderDrawer}
          app={app}
        />
      )}
      <BuilderComponent model="app" content={app as any} />
    </Layout>
  );
};

export default AppPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const results = await builder.getAll("app", {
    key: "apps:all",
    fields: "data.handle",
  });

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return {
    paths: results
      .map((item) => ({ params: { app: item.data!.handle } }))
      .concat([{ params: { app: "_" /* For previewing and editing */ } }]),
    fallback: true,
  };
};

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries.
export const getStaticProps: GetStaticProps = async (context) => {
  try {
    const data = await builder
      .get("app", {
        query: {
          // Get the specific article by handle
          "data.handle": context.params!.app,
        },
        ...{
          options: {
            includeRefs: true,
          } as any,
        },
      })
      .promise();
    // By returning { props: item }, the StaticPropsDetail component
    // will receive `item` as a prop at build time
    return { props: { app: JSON.parse(JSON.stringify(data)) }, revalidate: 1 };
  } catch (err) {
    return { props: { errors: err.message } };
  }
};
