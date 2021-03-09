import React, {
  useEffect,
  useMemo,
  useRef,
  Suspense,
  useCallback,
} from "react";
import { Flex } from "rebass";
import Properties from "../properties";
import {
  useStore,
  SESSION_STATES,
  store as editorstore,
} from "../../stores/editor-store";
import { useStore as useAppStore } from "../../stores/app-store";
import Animated from "../animated";
import Header from "./header";
import useMobile from "../../utils/use-mobile";
import useTablet from "../../utils/use-tablet";
import Toolbar from "./toolbar";
import Banner from "../banner";
import EditorLoading from "./loading";

const ReactMCE = React.lazy(() => import("./tinymce"));

function Editor({ noteId, nonce }) {
  const editorRef = useRef();
  const sessionState = useStore((store) => store.session.state);
  const sessionNonce = useStore((store) => store.session.nonce);
  const contentType = useStore((store) => store.session.content?.type);
  const setSession = useStore((store) => store.setSession);
  const saveSession = useStore((store) => store.saveSession);
  const newSession = useStore((store) => store.newSession);
  const openSession = useStore((store) => store.openSession);
  const toggleProperties = useStore((store) => store.toggleProperties);
  const updateWordCount = useStore((store) => store.updateWordCount);
  const init = useStore((store) => store.init);
  const isFocusMode = useAppStore((store) => store.isFocusMode);
  const isMobile = useMobile();
  const isTablet = useTablet();
  const editorMargins = useMemo(() => {
    if (isMobile || isTablet) return "0%";
    else return "10px";
  }, [isTablet, isMobile]);

  useEffect(() => {
    init();
  }, [init]);

  const startSession = useCallback(
    async function startSession(noteId) {
      if (noteId === 0) newSession(nonce);
      else if (noteId) {
        await openSession(noteId);
      }
    },
    [newSession, openSession, nonce]
  );

  useEffect(() => {
    if (!editorRef.current?.editor) return;
    (async () => {
      await startSession(noteId);
    })();
  }, [startSession, noteId]);

  useEffect(() => {
    if (sessionState === SESSION_STATES.new) {
      editorstore.set((state) => (state.session.state = SESSION_STATES.stale));
      const {
        content: { data },
      } = editorstore.get().session;
      const editor = editorRef.current?.editor;
      if (!editor) return;
      function setContents() {
        editor.undoManager.clear();
        editor.undoManager.add();
        editor.setDirty(false);

        // NOTE: workaround to not fire onEditorChange event on content load
        editor.isLoading = true;
        editor.setContent(data, { format: "html" });
      }
      setContents();
      editor.on("init", setContents);
      return () => {
        editor.off("init", setContents);
      };
    }
  }, [editorRef, contentType, sessionState, sessionNonce]);

  return (
    <Flex
      flexDirection="column"
      sx={{
        position: "relative",
        alignSelf: "stretch",
        overflow: "hidden",
      }}
      flex="1 1 auto"
    >
      {isMobile && <Banner />}
      <Toolbar />
      <Flex
        variant="columnFill"
        className="editorScroll"
        flexDirection="column"
        overflow="hidden"
        overflowY="auto"
      >
        <Animated.Flex
          variant="columnFill"
          className="editor"
          sx={{
            mx: [0, 0, editorMargins],
            alignSelf: ["stretch", "stretch", "center"],
          }}
          animate={{
            marginRight: isFocusMode && !isTablet ? "25%" : editorMargins,
            marginLeft: isFocusMode && !isTablet ? "25%" : editorMargins,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          maxWidth={isFocusMode ? "auto" : "900px"}
          width={["100%", "100%", isFocusMode ? "50%" : "100%"]}
          mt={[0, 0, 25]}
        >
          <Header />
          <Suspense fallback={<EditorLoading />}>
            {contentType === "tiny" ? (
              <ReactMCE
                editorRef={editorRef}
                onFocus={() => toggleProperties(false)}
                onSave={saveSession}
                onChange={(content) => {
                  if (!content.length) content = "<p><br></pr>";
                  setSession((state) => {
                    state.session.content = {
                      type: "tiny",
                      data: content,
                    };
                  });
                }}
                changeInterval={500}
                onWordCountChanged={updateWordCount}
                onInit={async () => {
                  await startSession(noteId);
                }}
              />
            ) : null}
          </Suspense>
        </Animated.Flex>
      </Flex>
      <Properties />
    </Flex>
  );
}
export default Editor;
