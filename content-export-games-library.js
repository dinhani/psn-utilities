// =============================================================================
// RUNNER FUNCTION
// =============================================================================
function runExportGamesLibrary() {
    // perform action of exporting games if necessary
    chrome.storage.local.get(["exportGamesLibrary"], function (result) {
        // check if should export
        let shouldExportGamesLibrary = result.exportGamesLibrary == true;
        if (shouldExportGamesLibrary) {
            chrome.storage.local.set({ exportGamesLibrary: false });
            exportGamesLibrary([]);
        } else {
            return;
        }
    });
}

// =============================================================================
// TASK FUNCTIONS
// =============================================================================
function exportGamesLibrary(games) {
    // get prices from current page
    jQuery(".download-list-item").each(function (index, element) {
        game = {};

        game.name = jQuery(element).find(".download-list-item__title").text().trim();

        game.platform =  jQuery(element).find(".download-list-item__playable-on-info").text();
        if(game.platform){
            game.platform = /(PS3|PS4|PS Vita)/.exec(game.platform)[0];
        }

        game.metadata = jQuery(element).find(".download-list-item__metadata").text().trim();
        game.type = game.metadata.split("|")[0].trim();
        game.size = game.metadata.split("|")[1].trim();
        game.buy = game.metadata.split("|")[2].trim();

        game.sizeInMB = game.size;
        game.sizeInMB = game.sizeInMB.replace("KB", " / 1024");
        game.sizeInMB = game.sizeInMB.replace("MB", " * 1");
        game.sizeInMB = game.sizeInMB.replace("GB", " * 1024");
        try {
            game.sizeInMB = eval(game.sizeInMB);
        } catch (e) {
            game.sizeInMB = 0;
        }

        games.push(game);
    });

    // check if reached last page
    var lastPage = jQuery(".paginator-control__end.paginator-control__arrow-navigation.paginator-control__arrow-navigation--disabled").length;
    if (lastPage) {
        // if last page, save collected games
        writeGamesToCsv(games);
    } else {
        // if not last page, go to next page and collect more games
        jQuery(".paginator-control__next")[0].click();
        setTimeout(function () { exportGamesLibrary(games) }, 200);
    }
}

function writeGamesToCsv(games) {
    csv = '"Name";"Size";"SizeInMB";"Type";"BuyDate";"Platform"<br>';
    for (var gameIndex = 0; gameIndex < games.length; gameIndex++) {
        csv += '"' + games[gameIndex].name + '"'
            + ";"
            + '"' + games[gameIndex].size + '"'
            + ";"
            + games[gameIndex].sizeInMB
            + ";"
            + '"' + games[gameIndex].type + '"'
            + ";"
            + '"' + games[gameIndex].buy + '"'
            + ";"
            + '"' + games[gameIndex].platform + '"'
            + "<br>";
    }
    document.write(csv);
}

// =============================================================================
// EXECUTION
// =============================================================================
setInterval(runExportGamesLibrary, 500);
