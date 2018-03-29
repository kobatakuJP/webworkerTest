import * as calc from "./calc";
import { NoDataTreat as NDT, CalcArg as CArg, CalcResult as CRslt } from "./calc";

enum WorkType {
    webworker,
    normal
}

const cg = document.getElementById("csvget");
let sb = new SharedArrayBuffer(12);
let bufView = new Float32Array(sb);

cg.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            requestCalc({ csv: a.responseText, targetCellNum: 5, noData: NDT.ignore }, getWorkType());
        }
    }
}

/** 画面のワークタイプ選択ラジオボタンからワークタイプを割り出す */
function getWorkType(): WorkType {
    const wr = <HTMLFormElement>document.getElementById("worktype-radio");
    return <WorkType>(parseInt(wr["worktype"].value));
}

async function requestCalc(arg: CArg, worktype: WorkType) {
    let result: calc.CalcResult;
    let time = Date.now();
    switch (worktype) {
        case WorkType.webworker:
            const c = new calc.CsvCalc(arg.csv, arg.noData);
            result = await c.getAve(arg.targetCellNum);
            break;
        case WorkType.normal:
            result = calc.normalCalc(arg);
            break;
        default:
            alert("worktypeがおかしいんじゃ:" + worktype);
    }
    time = Date.now() - time;
    resultOutPut(result, time, worktype);
}

function resultOutPut(result: CRslt, ms: number, worktype: WorkType) {
    const resultstr = result ? "worktype:" + WorkType[worktype] + "<br>time:" + ms + "ms" + "<br>linenum:" + result.lineNum + "<br>ave:" + result.val + "<br>nodata:" + result.noDataIdx.length : "null!";
    const d = <HTMLDivElement>document.getElementById("calc-result");
    d.innerHTML = resultstr;
}