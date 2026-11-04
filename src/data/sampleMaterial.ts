export interface SampleChapter {
  id: string;
  classLevel: number;
  subject: string;
  title: string;
  description: string;
  textNotes: string;
}

export const SAMPLE_CHAPTERS: SampleChapter[] = [
  {
    id: 'sample_c4_science',
    classLevel: 4,
    subject: 'Science',
    title: 'How Green Plants Make Food',
    description: 'Leaves, Chlorophyll, Sunlight, Stomata, and Photosynthesis for elementary students.',
    textNotes: `Chapter 3: Food Preparation in Green Plants

Green plants are living things that can make their own food. Because of this, they are called food producers.

1. The Leaf - The Food Factory:
Leaves are usually green in color because they contain a green pigment called chlorophyll. Chlorophyll traps energy from sunlight.
The flat broad surface of a leaf is called the lamina or leaf blade. Tiny openings on the underside of the leaf are called stomata. Stomata help the leaf breathe by taking in carbon dioxide gas from the air and releasing oxygen.

2. The Process of Photosynthesis:
Photo means "light" and synthesis means "putting together".
Plants absorb water and minerals from the soil through their roots. The stem carries this water to the leaves.
Using sunlight, carbon dioxide from the air, and water from the soil, the green leaves prepare simple food called glucose (sugar).
During this process, plants release oxygen into the air, which all animals and humans need to breathe.

3. Storage of Food:
The food prepared by the plant is used for growth and repairing damaged cells. The extra food is stored as starch in different parts like roots (carrot, radish), stems (potato, sugarcane), fruits (mango, apple), and seeds (rice, wheat).

4. Testing for Starch:
When iodine solution is added to starch, it turns blue-black. This proves that green leaves make starch in the presence of sunlight.`
  },
  {
    id: 'sample_c6_maths',
    classLevel: 6,
    subject: 'Mathematics',
    title: 'Fractions and Decimals',
    description: 'Proper, improper, mixed fractions, equivalent fractions, and decimal representation.',
    textNotes: `Chapter 7: Fractions & Understanding Parts of a Whole

A fraction represents a part of a whole or a collection of objects. The whole can be a single object or a group of objects divided into equal parts.

1. Parts of a Fraction:
A fraction is written as a/b where:
- 'a' is called the Numerator (number of parts taken).
- 'b' is called the Denominator (total number of equal parts into which the whole is divided).
Note: The denominator can never be zero.

2. Types of Fractions:
- Proper Fraction: The numerator is strictly less than the denominator (e.g., 2/5, 3/7, 1/2). Value is always less than 1.
- Improper Fraction: The numerator is greater than or equal to the denominator (e.g., 7/4, 9/5, 5/5). Value is greater than or equal to 1.
- Mixed Fraction: A combination of a whole number and a proper fraction (e.g., 2 1/3, which equals 7/3).
- Equivalent Fractions: Fractions that represent the same value even though they have different numerators and denominators (e.g., 1/2 = 2/4 = 3/6).

3. Like and Unlike Fractions:
- Like Fractions: Fractions having the same denominator (e.g., 2/9, 5/9, 7/9). They are easy to add or subtract directly.
- Unlike Fractions: Fractions with different denominators (e.g., 2/3 and 3/5). To compare or add them, we find the Least Common Multiple (LCM) of the denominators.`
  },
  {
    id: 'sample_c8_science',
    classLevel: 8,
    subject: 'Science',
    title: 'Cell - Structure and Functions',
    description: 'Discovery of cell, cell membrane, cytoplasm, nucleus, organelles, plant vs animal cells.',
    textNotes: `Chapter 8: Cell — Structure and Functions

1. Discovery of the Cell:
Robert Hooke in 1665 observed slices of cork from the bark of a tree under a primitive microscope. He noticed partitioned boxes or compartments like a honeycomb and named each box a 'cell'.

2. The Organisms: Number, Shape, and Size:
- Unicellular organisms: Single-celled organisms such as Amoeba and Paramecium. A single cell performs all essential functions like nutrition, respiration, excretion, and reproduction.
- Multicellular organisms: Organisms made of millions or trillions of cells (e.g., humans, trees).
- Shape of cells: Cells can be spindle-shaped (muscle cells), branched (nerve cells/neurons for transmitting messages), or spherical (red blood cells).

3. Parts of the Cell:
- Cell Membrane (Plasma Membrane): The porous boundary separating the cell contents from the surrounding medium. It regulates the movement of substances in and out.
- Cytoplasm: The jelly-like fluid between the cell membrane and the nucleus containing various cell organelles like mitochondria, ribosomes, and Golgi bodies.
- Nucleus: The spherical control center located in the center of the cell, bounded by a porous nuclear membrane. Contains thread-like structures called chromosomes, which carry genes responsible for inheritance of characters.

4. Comparison: Plant Cell vs Animal Cell:
- Plant cells have an outer thick layer called the Cell Wall made of cellulose for protection against temperature and wind. Animal cells lack a cell wall.
- Plant cells contain Plastids. Green plastids called Chloroplasts contain chlorophyll for photosynthesis.
- Plant cells have one large central vacuole, while animal cells have multiple small vacuoles.`
  },
  {
    id: 'sample_c9_history',
    classLevel: 9,
    subject: 'Social Science (History)',
    title: 'The French Revolution (1789)',
    description: 'Estate system, storming of the Bastille, Reign of Terror, Declaration of Rights of Man.',
    textNotes: `Chapter 1: The French Revolution (1789)

On the morning of 14 July 1789, the city of Paris was in a state of alarm. An enraged crowd stormed the fortress-prison of the Bastille, which stood for the despotic power of the king, marking the outbreak of the French Revolution.

1. French Society During the Late Eighteenth Century:
The society of estates was divided into three tiers:
- First Estate: Clergy (church officials), exempt from paying taxes, collected religious tithes.
- Second Estate: Nobility, held feudal privileges and top government offices, exempt from state taxes.
- Third Estate: Peasants, artisans, merchants, court officials, lawyers, making up 98% of the population. They bore the entire tax burden (taille and indirect taxes).

2. Causes of the Revolution:
- Financial Crisis: King Louis XVI ascended the throne in 1774 finding empty royal treasuries due to costly wars and assistance to thirteen American colonies.
- Subsistence Crisis: Rapid population growth from 23 million to 28 million led to acute grain shortages, skyrocketing bread prices, and starvation.
- Intellectual Awakening: Philosophers like John Locke (Two Treatises of Government), Jean-Jacques Rousseau (The Social Contract), and Montesquieu (The Spirit of the Laws) questioned absolute divine monarchy and proposed separation of powers.

3. Key Milestones:
- 5 May 1789: Louis XVI calls the Estates General.
- 20 June 1789: The Third Estate meets in an indoor tennis court at Versailles and swears the Tennis Court Oath to draft a constitution limiting royal power.
- 1791: France becomes a Constitutional Monarchy. The National Assembly adopts the "Declaration of the Rights of Man and of the Citizen", enshrining liberty, equality, and fraternity.
- 1793-1794: The Reign of Terror under Maximilien Robespierre and the Jacobin Club.`
  }
];
