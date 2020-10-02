
const data = require('../config/words');


class HuhuGen  {

    constructor() {
    }

    randomIndex(i) {
        return Math.floor(Math.random()*i);
    }


    generateHuhu(knownUsers, forceKnown = false) {
        var parsed = data;
        var useKnownNames = knownUsers.length && (forceKnown || Math.random() < 0.8);
        var singulars, plurals;
        if (useKnownNames) {
            singulars = knownUsers;
            plurals = [];
        } else {
            singulars = parsed.subjects.singular;
            plurals = parsed.subjects.plural;
        }
        var subjSingularSize = singulars.length;

        var totalSubjSize = subjSingularSize + plurals.length;

        var subjI = this.randomIndex(totalSubjSize);
        var singular = subjI < subjSingularSize;
        var subjI = singular ? subjI : subjI - subjSingularSize;
        var subj = singular ? singulars[subjI] : plurals[subjI];

        var verbArr = singular ? parsed.verbs.singular : parsed.verbs.plural;
        var verb = verbArr[this.randomIndex(verbArr.length)];

        var objArr = singular ? parsed.objects.singular : parsed.objects.plural;
        objArr = objArr.concat(parsed.objects.both);
        var obj = objArr[this.randomIndex(objArr.length)];

        var res = "Huhutaan että "+ subj + " " + verb + " " + obj;
        return  res;
    }

}
module.exports = HuhuGen;
