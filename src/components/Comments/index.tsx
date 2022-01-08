export default function Comments() {
  return (
    <section
      ref={element => {
        if (!element || element.childNodes.length) {
          return;
        }

        const scriptElement = document.createElement("script");
        scriptElement.setAttribute("src", "https://utteranc.es/client.js");
        scriptElement.setAttribute("async", "true");
        scriptElement.setAttribute("crossorigin", "anonymous");
        scriptElement.setAttribute("repo", "juliaramosguedes/rocketseat-ignite-react-space-travellng");
        scriptElement.setAttribute("issue-term", "pathname");
        scriptElement.setAttribute("theme", "dark-blue");
        scriptElement.setAttribute("label", "blog-comment");
        element.replaceChildren(scriptElement);
      }}
    />
  );
}
