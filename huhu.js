
const data = require('./words');


class HuhuGen  {

    constructor() {
    }

    randomIndex(i) {
        return Math.floor(Math.random()*i);
    }


    generateHuhu(prefix) {
        var parsed = data;
        var subjSingularSize = parsed.subjects.singular.length;
        var totalSubjSize = subjSingularSize + parsed.subjects.plural.length;
        var subjI = this.randomIndex(totalSubjSize);
        var singular = subjI < subjSingularSize;
        var subjI = singular ? subjI : subjI - subjSingularSize;
        var subj = singular ? parsed.subjects.singular[subjI] : parsed.subjects.plural[subjI];

        var verbArr = singular ? parsed.verbs.singular : parsed.verbs.plural;
        var verb = verbArr[this.randomIndex(verbArr.length)];

        var objArr = singular ? parsed.objects.singular : parsed.objects.plural;
        objArr = objArr.concat(parsed.objects.both);
        var obj = objArr[this.randomIndex(objArr.length)];

        return "Huhutaan että "+ subj + " " + verb + " " + obj
    }

}
module.exports = HuhuGen;
