import { Advisory } from "./models/advisory";
import { DepAdvisory } from "./models/dep-advisory";
import { OsvVulnerability } from "./models/osv-vulnerability";
import * as sanitizeHtml from "sanitize-html";

export const prepareReportHtml = (data: readonly DepAdvisory[]): string => {
    const sortedData = [...data].sort((a, b) => {
        const r = (b.advisories.length > 0 ? 1 : 0) - (a.advisories.length > 0 ? 1 : 0);
        if (a.advisories.length > 0 && b.advisories.length > 0) {
            return getMaxScore(b) - getMaxScore(a);
        }
        return r;
    });
    const resultHtml = `
        <!DOCTYPE html>
		<html lang="en">
		    <head>
			    <meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Report</title>
			</head>
            <style>
            section {
                display: table;
                border-spacing: 0px 20px;
            }
        
            section header {
                border-bottom: 1px solid black;
            }
        
            section .row,
            section header {
                display: table-row;
            }
        
            section .col {
                display: table-cell;
                padding: 0 20px 0 0px;
            }
        
            .name-col .name {
                font-weight: bold;
                line-height: 25px;
            }
        
            .details-col {
                width: 100%;
            }
        
            .advisories {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }
        
            .advisory {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
        
            .ok {
                color: green;
            }

            .warn {
                color: red;
            }

            .scoreLow {
                color: #4DB508;
                border: 1px solid #4DB508;
                border-radius: 4px;
                padding: 1px 6px;                
            }

            .scoreMedium {
                color: #F4BC1B;
                border: 1px solid #F4BC1B;
                border-radius: 4px;
                padding: 1px 6px;                
            }

            .scoreHigh {
                color: #EA721C;
                border: 1px solid #EA721C;
                border-radius: 4px;
                padding: 1px 6px;                
            }

            .scoreCritical {
                color: #E52D19;
                border: 1px solid #E52D19;
                border-radius: 4px;
                padding: 1px 6px;                
            }

            .details {
                word-wrap: break-word;
            }
        </style>
			<body>
				${renderTable(sortedData)}
			</body>
			</html>`;
    return resultHtml;
};

const renderTable = (data: readonly DepAdvisory[]): string => {
    const result = `
    <h2 class="report-header ${data[0].advisories.length ? 'warn' : 'ok'}">${data[0].advisories.length ? 'Problems detected' : 'All is ok!'}</h2>
    <section>
        
        ${data.map(d => renderRow(d)).join('')}
    </section>`;
    return result;
};

const renderRow = (data: DepAdvisory): string => {
    const result = `
    <div class='row'>
        <div class='col name-col'>
            <span class='name'>${data.name}@${data.version}</span>
            <br>
            <span class='totalScore ${getTotalScoreClass(data)}'>${getTotalScoreAlias(data)}</span>
        </div>
        <div class='col details-col'>
            ${renderProblems(data.advisories)}
        </div>
    </div>`;
    return result;
};

const renderProblems = (data: readonly Advisory[]): string => {
    if (!data.length) {
        return '<span class="ok">OK</span>';
    }

    const sorted = [...data].sort((a, b) => b.cvss3Score - a.cvss3Score);
    const result = `
    <div class='advisories'>
        ${sorted.map(x => renderAdvisory(x)).join('')}
    </div>`;
    return result;
};

const renderAdvisory = (data: Advisory): string => {
    const result = `
    <div class='advisory'>
        <div><b>${data.title}</b></div>
        <div><a target='_blank' href='${data.url}'>${sanitizeHtml(data.url)}</a></div>
        <div>cvss3Score: <span class='${calcScoreColorClass(data.cvss3Score)}'>${data.cvss3Score}&nbsp;${calcScoreAlias(data.cvss3Score)}</span></div>
        <div>cvss3Vector: ${data.cvss3Vector}</div>
        <div class='aliases'>${data.aliases.map(a => renderAliase(a)).join('')}</div>
        ${renderDetails(data.details)}
    </div>`;
    return result;
};

const renderAliase = (data: string): string => {
    return `<div>${sanitizeHtml(data)}</div>`;
};

const renderDetails = (data?: OsvVulnerability): string | undefined => {
    if (!data?.summary) {
        return;
    }
    
    const result = `
        <div class='details'>
        ${sanitizeHtml(data.details)}
        </div>
    `;
    return result;
};

const calcScoreColorClass = (score: number): string => {
    return `score${calcScoreAlias(score)}`;
};

const calcScoreAlias = (score: number): string => {
    if (score < 4) {
        return "Low";
    }
    if (score < 7) {
        return "Medium";
    }
    if (score < 9) {
        return "High";
    }
    return "Critical";
};

const getMaxScore = (data: DepAdvisory): number => {
    if (!data.advisories.length) {
        return 0;
    }
    const maxScore = Math.max(...data.advisories.map(x => x.cvss3Score));
    return maxScore;
};

const getTotalScoreClass = (data: DepAdvisory): string | null => {
    if (!data.advisories.length) {
        return null;
    }

    return calcScoreColorClass(getMaxScore(data));
};

const getTotalScoreAlias = (data: DepAdvisory): string | null => {
    if (!data.advisories.length) {
        return null;
    }

    return calcScoreAlias(getMaxScore(data));
};