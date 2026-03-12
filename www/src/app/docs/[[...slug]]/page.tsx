import { getPageImage, source } from "@/lib/source";
import { DocsBody } from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { AnchorProvider } from "fumadocs-core/toc";
import { findNeighbour, } from "fumadocs-core/page-tree";
// import { TOC } from "@/components/layout/toc";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const tree = source.getPageTree();
  const neighbours = findNeighbour(tree, page.url);

  const gitConfig = {
    user: "nabinkhair42",
    repo: "pest.js",
    branch: "main",
  };

  return (
    <AnchorProvider toc={page.data.toc}>
      <div className="md:flex space-x-3">
        <article className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-dashed pl-4 md:px-4 py-6 space-y-6 md:space-y-0">
            {/* Title + Description */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {page.data.title}
              </h1>
              {page.data.description && (
                <p className="text-muted-foreground">
                  {page.data.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
              <ViewOptions
                markdownUrl={`${page.url}.mdx`}
                githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/content/docs/${page.path}`}
              />
            </div>
          </div>

          {/* Body */}
          <DocsBody className="px-4 text-normal">
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          </DocsBody>

          {/* Footer navigation */}
          <nav className="flex flex-col gap-4 border-t border-dashed sm:flex-row sm:items-stretch px-4 py-6">
            {neighbours.previous ? (
              <Link
                href={neighbours.previous.url}
                className="group flex flex-1 flex-col gap-1 rounded-md border border-dashed p-4 transition-colors hover:bg-accent/50"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronLeft className="size-3" />
                  Previous
                </span>
                <span className="text-sm font-medium">
                  {neighbours.previous.name}
                </span>
              </Link>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
            {neighbours.next ? (
              <Link
                href={neighbours.next.url}
                className="group flex flex-1 flex-col items-end gap-1 rounded-md border border-dashed p-4 transition-colors hover:bg-accent/50"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Next
                  <ChevronRight className="size-3" />
                </span>
                <span className="text-sm font-medium">
                  {neighbours.next.name}
                </span>
              </Link>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
          </nav>
        </article>

        {/* Table of contents — fixed width column to prevent layout jumping */}
        {/* <div className="hidden w-56 shrink-0 py-8 pr-6 md:block">
          <TOC items={page.data.toc} />
        </div> */}
      </div>
    </AnchorProvider>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
