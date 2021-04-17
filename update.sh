git remote remove template
git remote add template https://github.com/elliscode/container-weights-calculator.git
git remote set-url --push template no-pushing

git fetch template
git merge template/master --allow-unrelated-histories -m "merging latest template"