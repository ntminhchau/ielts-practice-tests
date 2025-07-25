:root {
    --primary-color: #005b96;
    --secondary-color: #eef2f5;
    --border-color: #ced4da;
    --correct-color: #28a745;
    --incorrect-color: #dc3545;
    --text-color: #343a40;
    --light-text: #fff;
    --panel-bg: #fff;
    --highlight-yellow: rgba(255, 255, 0, 0.4);
    --highlight-pink: rgba(255, 105, 180, 0.4);
    --highlight-cyan: rgba(0, 255, 255, 0.4);
    --highlight-green: rgba(144, 238, 144, 0.4);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    background-color: var(--secondary-color);
    color: var(--text-color);
}

.container {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
}

.hidden { display: none !important; }

/* --- Home Page --- */
#home-page h1 { text-align: center; color: var(--primary-color); }
#home-page h2 { border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-top: 40px; }
.test-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.test-card { background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.button-group { margin-top: 15px; display: flex; gap: 10px; }
.main-btn, .start-btn { flex-grow: 1; padding: 10px; border: 1px solid var(--primary-color); background-color: var(--primary-color); color: var(--light-text); border-radius: 5px; cursor: pointer; transition: background-color 0.2s; font-size: 1em; }
.start-btn.untimed { background-color: var(--light-text); color: var(--primary-color); }
.main-btn:hover, .start-btn:hover { opacity: 0.9; }
#phrasebook-btn { display: block; margin: 20px auto; width: 200px; }

/* --- Test Page --- */
#test-page, #results-page { display: flex; flex-direction: column; height: calc(100vh - 40px); }
.test-header, .results-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); }
.timer { font-weight: bold; font-size: 1.2em; color: var(--incorrect-color); }
.test-container, .results-container { display: flex; flex-grow: 1; overflow: hidden; border: 1px solid var(--border-color); margin: 10px 0; }
.panel { padding: 20px; overflow-y: auto; background: var(--panel-bg); height: 100%; box-sizing: border-box; }
#reading-panel, #results-reading-panel { flex: 1 1 50%; }
#questions-panel, #review-container { flex: 1 1 50%; }
.resizer { flex: 0 0 10px; background-color: var(--secondary-color); cursor: col-resize; position: relative; }
.resizer::before { content: '...'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); font-size: 18px; letter-spacing: -2px; color: #999; }

/* --- Footer --- */
.test-footer { position: relative; border-top: 1px solid var(--border-color); background: var(--panel-bg); }
.footer-toggle { padding: 8px; text-align: center; cursor: pointer; background: #f1f1f1; border-bottom: 1px solid var(--border-color); }
#question-navigation-container { display: flex; flex-direction: column; gap: 10px; padding: 10px; max-height: 200px; overflow-y: auto; }
#question-navigation-container.collapsed { display: none; }
.nav-section { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.nav-section-title { font-weight: bold; white-space: nowrap; }
.nav-btn { width: 30px; height: 30px; border: 1px solid var(--border-color); background: #fff; cursor: pointer; border-radius: 4px; }
.nav-btn.current { background-color: var(--primary-color); color: var(--light-text); border-color: var(--primary-color); }
.nav-btn.answered { text-decoration: underline; font-weight: bold; }
#end-test-btn { padding: 8px 16px; background-color: var(--incorrect-color); color: var(--light-text); border: none; border-radius: 5px; cursor: pointer; position: absolute; bottom: 10px; right: 10px; }

/* --- Question Styling --- */
.question-group { margin-bottom: 25px; }
.question-group h4, .question-group .instructions { background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
.question { margin-bottom: 20px; }
.question label { display: block; margin-bottom: 5px; }
.question input[type="text"] { width: 90%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; }
.question select { width: auto; min-width: 150px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; }
.horizontal-options { display: flex; gap: 15px; align-items: center; }
.horizontal-options label { margin-bottom: 0; }

/* --- Results Page --- */
.results-summary { display: flex; gap: 30px; }
.review-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; cursor: pointer; }
.review-item:hover { background-color: #f8f9fa; }
.correct-answer { color: var(--correct-color); font-weight: bold; }
.incorrect-answer { color: var(--incorrect-color); font-weight: bold; text-decoration: line-through; }
.explanation { background-color: #eef7ff; border-left: 4px solid var(--primary-color); padding: 10px; margin-top: 10px; font-style: italic; }
mark { background-color: var(--highlight-yellow); padding: 2px 0; border-radius: 3px; }
#back-to-home-btn { padding: 10px 20px; background-color: var(--primary-color); color: var(--light-text); border: none; border-radius: 5px; cursor: pointer; }

/* --- Highlighter --- */
.highlight { border-radius: 3px; }
.highlight.yellow { background-color: var(--highlight-yellow); }
.highlight.pink { background-color: var(--highlight-pink); }
.highlight.cyan { background-color: var(--highlight-cyan); }
.highlight.green { background-color: var(--highlight-green); }
#highlighter-toolbar { position: fixed; background: #fff; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; padding: 5px; gap: 5px; }
.color-box { width: 20px; height: 20px; cursor: pointer; border: 2px solid transparent; border-radius: 3px; }
.color-box.active { border-color: var(--primary-color); }
.color-box.yellow { background-color: var(--highlight-yellow); }
.color-box.pink { background-color: var(--highlight-pink); }
.color-box.cyan { background-color: var(--highlight-cyan); }
.color-box.green { background-color: var(--highlight-green); }
#eraser-btn { cursor: pointer; padding: 0 5px; }

/* --- Modals --- */
#dictionary-modal, #phrasebook-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
#modal-content, #phrasebook-content { background: #fff; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
#phrasebook-list { max-height: 300px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 15px; }
#phrasebook-list div { padding: 5px 0; border-bottom: 1px solid #f1f1f1; }
