(function(doc) {
    const appNode = doc.querySelector(`#app`);

    const displayedCardCount = 20;
    const intervalBase = 1000;
    const intervalVariation = .9 * intervalBase;
    const flashDurationBase = 1000;
    const flashVariation = .4 * flashDurationBase;
    const flashCount = 24;

    const $appendNode = targetNode => node => targetNode.appendChild(node);
    const $appendToApp = $appendNode(appNode);


    const cards = Array.from({ length: displayedCardCount })
        .map(() => {
            const card = Card();
            $appendToApp(card.node);
            return card;
        });


    // TODO only one click per flashed card. click that didn't hit the card counts as a miss
    // TODO user can set params
    // TODO min/max intervals
    // TODO predefined sequences via code so user can repeat same sequence

    doc.querySelector(`#btn-start`).addEventListener(`click`, ({ target }) => {
        target.parentNode.removeChild(target);
        appNode.requestFullscreen()
            .then($nextCard(flashCount))
            .then(hits => {
                // TODO nicer presentation of result
                const percentage = (hits / flashCount * 100).toFixed(1);
                alert(`Done! Hit count: ${hits} out of ${flashCount} (${percentage}%)`);
                doc.exitFullscreen();
            });
    }, { once: true });


    function $nextCard(remaining) {
        return () => new Promise(resolve => {
            let hits = 0;
            _$nextCard(remaining);


            function _$nextCard(remaining) {
                if (remaining === 0) return resolve(hits);

                const interval = intervalBase + $randInt(intervalVariation) - intervalVariation / 2;

                setTimeout(() => {
                    const card = cards[$randInt(cards.length)];
                    card.$on();

                    new Promise(resolve => {
                        const flashDuration = flashDurationBase + $randInt(flashVariation) - flashVariation / 2;
                        const listener = () => {
                            resolve(`mousedown`);
                        };
                        card.node.addEventListener(`mousedown`, listener, { once: true });

                        setTimeout(() => {
                            card.node.removeEventListener(`mousedown`, listener);
                            resolve(`timeout`);
                        }, flashDuration);

                    }).then(result => {
                        if (result === `mousedown`) {
                            hits++;
                        }
                        // else if (result === `timeout`) {
                        // }

                        $separateFrames([
                            () => card.$off(),
                            () => _$nextCard(remaining -1)
                        ]);
                    });
                }, interval);
            }
        });
    }


    function Card() {
        const node = $importTemplate(doc.querySelector(`#tap-card`));
        const card = node.children[0];

        return Object.freeze({
            node,
            $on: () => card.classList.add(`active`),
            $off: () => card.classList.remove(`active`),
        });
    }

    function $importTemplate({ content }) {
        const wrapper = doc.createElement(`div`);
        wrapper.appendChild(doc.importNode(content, true));
        const inner = wrapper.children[0];
        wrapper.removeChild(inner);

        return inner;
    }

    function $randInt(length) {
        return Math.floor(Math.random() * length);
    }

    function $separateFrames(fns) {
        if (fns.length === 0) return;
        requestAnimationFrame(() => {
            fns[0]();
            $separateFrames(fns.slice(1));
        });
    }

}(document));
