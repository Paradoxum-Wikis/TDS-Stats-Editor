export default class Alert {
    /**
     * @param {string} text
     * @param {{
     * alertStyle: 'alert-success'|'alert-warning'|'alert-danger',
     * alertTimeInSeconds: number
     * }} options
     */
    constructor(text, options) {
        this.root = document.getElementById('alert-container');

        this.text = text;
        this.classList = ['alert', 'd-inline', 'm-auto', 'mb-1', 'fade'];
        this.alertStyle = options.alertStyle ?? 'alert-primary';
        this.alertTimeInSeconds = 1;
        this.timeToDeleteAfterFadeOut = 0.3;
        this.timeBeforeShow = 0.002;
    }

    #constructAlert() {
        const alert = document.createElement('div');
        [...this.classList, this.alertStyle].forEach((className) =>
            alert.classList.add(className)
        );

        alert.innerText = this.text;

        return alert;
    }
    #wait(seconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, (seconds ?? 0) * 1000);
        });
    }

    async fire() {
        const alert = this.#constructAlert();
        this.root.appendChild(alert);

        await this.#wait(this.timeBeforeShow);
        alert.classList.add('show');

        await this.#wait(this.alertTimeInSeconds);
        alert.classList.remove('show');

        await this.#wait(this.timeToDeleteAfterFadeOut);
        alert.remove();
    }
}
