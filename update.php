<?php
// Spécifiez le chemin absolu du dépôt Git
$git_dir = getcwd();

// Exécutez la commande `git pull` en utilisant la fonction `exec()`
$output = array();
$return_var = 0;
exec("cd $git_dir && git pull 2>&1", $output, $return_var);

// Affichez le résultat de la commande `git pull`
echo "Output: \n" . implode("\n", $output) . "\n";
echo "Return var: " . $return_var . "\n";
?>
