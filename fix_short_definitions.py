#!/usr/bin/env python3
import json

def expand_short_definitions():
    """Expand definitions that are too short to provide meaningful context"""
    
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    fixes_applied = 0
    
    # Manual expansions for common short definitions
    expansions = {
        'Usually.': 'In most cases or instances; as a general rule.',
        'To look at.': 'To direct one\'s gaze toward; to view or observe something.',
        'A goalpost.': 'A vertical post that forms part of a goal in various sports.',
        'Reputation.': 'The general opinion or esteem in which a person or thing is held.',
        'In advance.': 'Before a particular time; beforehand or ahead of schedule.',
        'A painting.': 'A work of art created with paint on a surface such as canvas.',
        'Big; angry.': 'Large in size; or feeling or showing strong displeasure.',
        'Very young.': 'Of a very early age; in the early stages of life or development.',
        'Compliance.': 'The act of conforming to or meeting rules, standards, or laws.',
        'To be sold.': 'To be available for purchase; to be exchanged for money.',
        'A marriage.': 'A legally or formally recognized union between two people.',
        'A handbook.': 'A concise reference book providing specific information or instructions.',
        'The police.': 'Slang term for law enforcement officers or police presence.',
        'A fastball.': 'A high-speed pitch in baseball; slang for something delivered quickly.',
        'Inaccurate.': 'Not exact or correct; containing errors or mistakes.',
        'Last night.': 'The previous night; the night before the current one.',
        'The wicket.': 'In cricket, the set of stumps and bails; the pitch between the stumps.',
        'A nonplus .': 'A state of perplexity or confusion; being at a loss.',
        'Antithesis.': 'The direct opposite or contrast of something.',
        'The unknown.': 'That which is not known or understood; the realm of uncertainty.',
        'The hereafter.': 'Life after death; the afterlife or future existence.',
        'Further down.': 'At a lower position or level; toward the bottom.',
        'Downstream of.': 'In the direction that a stream or river flows from a point.',
        'Main section.': 'The principal or most important part of something.',
        'Physical frame.': 'The physical structure of a person or animal.',
        'Coherent group.': 'A collection of things or people forming a unified whole.',
        'Material entity.': 'A physical object or substance that has material existence.',
        'Preparation.': 'The action or process of making ready or being made ready.',
        'To take heed.': 'To pay attention to; to take notice or be mindful of.',
        'Small in size.': 'Of limited dimensions; not large in physical measurements.',
        'A small amount.': 'A quantity that is not large; a limited portion or measure.',
        'Thermal energy.': 'Energy in the form of heat; warmth or high temperature.',
        '(of people).': 'When referring to people: kind, virtuous, or morally excellent.',
        '(of quantities).': 'When referring to amounts: considerable, substantial, or ample.',
        '(of capabilities).': 'When referring to abilities: competent, skilled, or proficient.',
        'To associate.': 'To connect or bring into relation; to join in companionship.',
        'Total, entire.': 'Complete in extent or degree; containing all components.',
        'To experience.': 'To encounter or undergo; to be aware of through the senses.',
        'A clothesline.': 'A rope or wire on which clothes are hung to dry.',
        'A blood group.': 'A classification of blood based on antibodies and antigens.',
        'To interact.': 'To act in such a way as to have an effect on each other.',
        'A guarantee.': 'A formal promise or assurance that certain conditions will be fulfilled.',
        'Grief, sorrow.': 'Mental suffering or distress; deep sadness or regret.',
        'A photograph.': 'An image created by capturing light on a photosensitive surface.',
        'To direct speech.': 'To speak to someone directly; to communicate verbally with.',
        'To be accepted.': 'To be received with approval or favorable reception.',
        'To change place.': 'To move from one location or position to another.',
        'An easy task.': 'Something that can be accomplished without difficulty.',
        'Ones daughter.': 'A female child in relation to her parents.',
        'Crack cocaine.': 'A highly addictive form of cocaine that can be smoked.',
        'In any event.': 'Whatever happens; regardless of circumstances.',
        'An argument.': 'A heated disagreement or quarrel; a verbal dispute.',
        'Exactly; just.': 'In a precise manner; without anything else.',
        'Immediately.': 'Without delay; instantly or at once.',
        'To enter data.': 'To input information into a computer or system.',
        'An old person.': 'A person of advanced age; an elderly individual.',
        'Fine; lovely.': 'Of excellent quality; impressive or magnificent.',
        'An accusation.': 'A claim that someone has done something wrong or illegal.',
        'An instruction.': 'A direction or order given to someone.',
        'To make busy.': 'To provide work for; to hire or engage in service.',
        'Soft, quiet.': 'Musical direction meaning to play softly or quietly.',
        'Hanging down.': 'Suspended from above; relying on or determined by.',
        'A young person.': 'An individual in the early stage of life; a child or adolescent.',
        'To form buds.': 'To produce or develop buds, as a plant does.',
        'Deserving of.': 'Meriting or justifying; having value equal to.',
        'A hunchback.': 'Archaic or dialectal term for someone with a curved spine.',
        'An ironclad.': 'A 19th-century warship protected by iron or steel armor plates.',
        'An endeavour.': 'A serious attempt or try; earnest and industrious effort.',
        'Without equal.': 'Having no match or equivalent; unique or unparalleled.',
        'Exclusively.': 'To the exclusion of others; solely or only.',
        'A cut of meat.': 'A piece of meat as prepared by a butcher.',
        'Located above.': 'Positioned higher than something else; overhead.',
        'Meal; flour.': 'Archaic term for ground grain or the edible part.',
        'An explosion.': 'A violent expansion with noise and force; a loud sound.',
        'A police officer.': 'Slang term for a law enforcement officer.',
        'Very small.': 'Extremely little in size; minute or miniature.',
        'A television.': 'Informal term for a television set or TV.',
        'To encircle.': 'To form a circle around; to surround or encompass.',
        'Very large.': 'Of very great size or extent; huge or enormous.',
        'Eager longing.': 'An intense desire or yearning for something.',
        'A clock face.': 'The part of a clock that displays the time.',
        'Place; stead.': 'Space that can be occupied; capacity for something.',
        'Size; scope.': 'The relative size or extent of something.',
        'A sports team.': 'A team representing one position in a competitive match.',
        'An advantage.': 'A favorable position giving superiority over others.',
        'An objective.': 'A piece of work to be done or undertaken; a goal.',
        'Something real.': 'The genuine article; authentic or true material.',
        'To cultivate.': 'To prepare and work on land for growing crops.',
        'Unsteady.': 'Not stable or firmly fixed; likely to change.',
        'To change.': 'To make or become different; to alter or modify.',
        'To journey.': 'To travel or go from one place to another.',
        'Soft.': 'Not hard or firm to the touch; gentle or mild.',
        'To prepare.': 'To make ready beforehand for a specific purpose.',
        'To shape.': 'To give a particular form or configuration to something.'
    }
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        
        for i, defn in enumerate(definitions):
            if defn in expansions:
                old_def = defn
                new_def = expansions[defn]
                definitions[i] = new_def
                fixes_applied += 1
                print(f"Expanded {word}: '{old_def}' -> '{new_def}'")
            elif len(defn) < 20:
                # Handle other short definitions not in our manual list
                # These might need context-specific expansion
                pass
    
    # Save the updated data
    with open('puzzle.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nTotal expansions applied: {fixes_applied}")
    
if __name__ == "__main__":
    expand_short_definitions()