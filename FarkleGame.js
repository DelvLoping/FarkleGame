const prompt=require("prompt-sync")({sigint:true});  

class FarkleGame {
// ----------------------< Game rules constants >-----------------------------------------------------------------------
// Rules can be parametrized by this globals constants
//
// Standard Farkle rules :
// 5 dices with 6 faces
// 1 & 5 are scoring
// 1 is scoring 100 pts
// 5 is scoring 50 pts
//
// Bonus for 3 dices with the same value
// 3 ace is scoring 1000 pts
// 3 time the same dice value is scoring 100 pts x the dice value
    constructor(){
        this.NB_DICE_SIDE = 6; // Nb of side of the Dices
        this.SCORING_DICE_VALUE = [1, 5]; // list_value of the side values of the dice who trigger a standard score
        this.SCORING_MULTIPLIER = [100, 50]; // list_value of multiplier for standard score

        this.THRESHOLD_BONUS = 3; // Threshold of the triggering for bonus in term of occurrence of the same slide value
        this.STD_BONUS_MULTIPLIER = 100; // Standard multiplier for bonus
        this.ACE_BONUS_MULTIPLIER = 1000; // Special multiplier for aces bonus

        this.DEFAULT_DICES_NB = 5; // Number of dices by default in the set
    }

    roll_dice_set(nb_dice_to_roll) {
        /** Generate the occurrence list of dice value for nb_dice_to_roll throw
        :parameters nb_dice_to_roll the number of dice to throw
        :return: occurrence list of dice value
        */

        const dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
        let dice_index = 0;
        while (dice_index < nb_dice_to_roll) {
            const dice_value = Math.floor(Math.random() * this.NB_DICE_SIDE + 1);
            dice_value_occurrence[dice_value - 1] += 1;
            dice_index += 1;
        }
        return dice_value_occurrence;
    }

    analyse_bonus_score(dice_value_occurrence) {
        /** Compute the score for bonus rules and update occurrence list
        :parameters dice_value_occurrence occurrence list of dice value
        :return: a dictionary with
        - 'score' the score from bonus rules
        - 'scoring_dice' occurrence list of scoring dice value
        - 'non_scoring_dice' occurrence list of non scoring dice value
        */
        const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);

        let bonus_score = 0;
        let side_value_index = 0;
        while (side_value_index < dice_value_occurrence.length) {
            const side_value_occurrence = dice_value_occurrence[side_value_index];
            const nb_of_bonus = Math.floor(side_value_occurrence / this.THRESHOLD_BONUS);
            if (nb_of_bonus > 0) {
                const bonus_multiplier = side_value_index === 0 ? this.ACE_BONUS_MULTIPLIER : this.STD_BONUS_MULTIPLIER;
                bonus_score += nb_of_bonus * bonus_multiplier * (side_value_index + 1);
                // update the occurrence list after bonus rules for scoring dices and non scoring dices
                dice_value_occurrence[side_value_index] %= this.THRESHOLD_BONUS;
                scoring_dice_value_occurrence[side_value_index] = nb_of_bonus * this.THRESHOLD_BONUS;
            }
            side_value_index += 1;
        }

        return {
        score: bonus_score,
        scoring_dice: scoring_dice_value_occurrence,
        non_scoring_dice: dice_value_occurrence,
        };
    }

    analyse_standard_score(dice_value_occurrence) {
        const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
        let standard_score = 0;
        let scoring_dice_value_index = 0;
        while (scoring_dice_value_index < this.SCORING_DICE_VALUE.length) {
            const scoring_value = this.SCORING_DICE_VALUE[scoring_dice_value_index];
            const scoring_multiplier = this.SCORING_MULTIPLIER[scoring_dice_value_index];
            standard_score += dice_value_occurrence[scoring_value - 1] * scoring_multiplier;

            scoring_dice_value_occurrence[scoring_value - 1] = dice_value_occurrence[scoring_value - 1];
            dice_value_occurrence[scoring_value - 1] = 0;

            scoring_dice_value_index++;
        }
        return {
            'score': standard_score,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': dice_value_occurrence
        };
    }

    analyse_score(dice_value_occurrence) {
        const analyse_score_bonus = this.analyse_bonus_score(dice_value_occurrence);
        const score_bonus = analyse_score_bonus['score'];
        const scoring_dice_from_bonus = analyse_score_bonus['scoring_dice'];
        const non_scoring_dice_from_bonus = analyse_score_bonus['non_scoring_dice'];
        
        const analyse_score_std = this.analyse_standard_score(non_scoring_dice_from_bonus);
        const score_std = analyse_score_std['score'];
        const scoring_dice_from_std = analyse_score_std['scoring_dice'];
        const non_scoring_dice_from_std = analyse_score_std['non_scoring_dice'];
        
        const scoring_dice_value_occurrence = new Array(this.NB_DICE_SIDE).fill(0);
        let side_value_index = 0;
        while (side_value_index < this.NB_DICE_SIDE) {
            scoring_dice_value_occurrence[side_value_index] = scoring_dice_from_bonus[side_value_index] +
                scoring_dice_from_std[side_value_index];
            side_value_index++;
        }
        
        return {
            'score': score_std + score_bonus,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': non_scoring_dice_from_std
        };
    }

    game_turn(is_interactive = true) {
        // turn start with the full set of dices
        let remaining_dice_to_roll = this.DEFAULT_DICES_NB;
        let roll_again = true;
        
        let turn_score = 0;
        while (roll_again) {
            // generate the dice roll and compute the scoring
            let dice_value_occurrence = this.roll_dice_set(remaining_dice_to_roll);
            let roll_score = this.analyse_score(dice_value_occurrence);
            remaining_dice_to_roll = sum(roll_score['non_scoring_dice']);
            
            if (roll_score['score'] == 0) {
            // lost roll
            
            console.log('\n-->', 'got zero point ', turn_score, 'lost points\n');
            
            roll_again = false;
            turn_score = 0;
            } else {
            // scoring roll
            
            turn_score += roll_score['score'];
            
            // In case of scoring roll and no remaining dice to roll the player can roll again the full set of dices
                if (remaining_dice_to_roll == 0) {
                    remaining_dice_to_roll = this.DEFAULT_DICES_NB;
                    console.log('-->Full Roll');
                }
            
                console.log('Roll Score=', roll_score['score'], 'potential turn score=', turn_score, 'remaining dice=', remaining_dice_to_roll);
            
                // choice to roll again or stop and take roll score
                let stop_turn =false
                if (is_interactive) {
                    // interactive decision for real game
                    stop_turn = prompt("Do you want to roll this dice ? [y/n] ") == "n";
                } else {
                    // random decision for game simulation (50/50)
                    stop_turn= (Math.floor(Math.random() * 100) % 2) == 0;
                }
                if (stop_turn) {
                    // stop turn and take roll score
            
                    console.log('\n-->', 'Scoring turn with', turn_score, 'points\n');
            
                    roll_again = false;
                }
            }
        }
        return turn_score;
    }

    
}

function sum(array)
{
    return array.reduce(function (a, b) { return a + b; }, 0)
}
